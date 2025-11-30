"""
XGBoost-based Pricing Advisor
Predicts optimal prices based on historical sales data
"""

import sys
import json
import codecs
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

try:
    import xgboost as xgb
    from sklearn.preprocessing import LabelEncoder
    from sklearn.model_selection import train_test_split
except ImportError:
    print(json.dumps({
        'success': False,
        'error': 'XGBoost not installed. Run: pip install xgboost scikit-learn'
    }))
    sys.exit(1)


class PricingAdvisor:
    """XGBoost-based pricing recommendation system"""
    
    def __init__(self):
        self.model = None
        self.label_encoder = LabelEncoder()
        self.feature_names = []
        
    def prepare_features(self, transactions):
        """Convert transaction data to features for XGBoost"""
        df = pd.DataFrame(transactions)
        
        if df.empty:
            return None
        
        # Parse dates
        df['date'] = pd.to_datetime(df['date'])
        df['month'] = df['date'].dt.month
        df['day_of_week'] = df['date'].dt.dayofweek
        df['day_of_month'] = df['date'].dt.day
        df['week_of_year'] = df['date'].dt.isocalendar().week
        
        # Extract item name from description
        df['item'] = df['description'].str.extract(r'(साड़ी|लहंगा|कुर्ती|कुर्ता|दुपट्टा|ब्लाउज|शर्ट|पैंट|ड्रेस)', expand=False)
        
        # Fill missing items with 'अन्य'
        df['item'] = df['item'].fillna('अन्य')
        
        # Encode categorical variables
        df['item_encoded'] = self.label_encoder.fit_transform(df['item'])
        
        # Create time-based features
        df['is_wedding_season'] = df['month'].isin([4, 5, 11, 12]).astype(int)
        df['is_festival_season'] = df['month'].isin([9, 10, 11]).astype(int)
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Calculate rolling statistics (if enough data)
        if len(df) > 7:
            df['rolling_avg_7d'] = df['amount'].rolling(window=7, min_periods=1).mean()
            df['rolling_std_7d'] = df['amount'].rolling(window=7, min_periods=1).std().fillna(0)
        else:
            df['rolling_avg_7d'] = df['amount'].mean()
            df['rolling_std_7d'] = 0
        
        if len(df) > 30:
            df['rolling_avg_30d'] = df['amount'].rolling(window=30, min_periods=1).mean()
        else:
            df['rolling_avg_30d'] = df['amount'].mean()
        
        # Calculate demand metrics per item
        item_stats = df.groupby('item')['amount'].agg(['mean', 'std', 'count']).reset_index()
        item_stats.columns = ['item', 'item_avg_price', 'item_std_price', 'item_sales_count']
        item_stats['item_std_price'] = item_stats['item_std_price'].fillna(0)
        df = df.merge(item_stats, on='item', how='left')
        
        # Feature columns
        feature_cols = [
            'item_encoded', 'month', 'day_of_week', 'day_of_month', 'week_of_year',
            'is_wedding_season', 'is_festival_season', 'is_weekend',
            'rolling_avg_7d', 'rolling_std_7d', 'rolling_avg_30d',
            'item_avg_price', 'item_std_price', 'item_sales_count'
        ]
        
        self.feature_names = feature_cols
        
        return df, feature_cols
    
    def train_model(self, transactions):
        """Train XGBoost model on historical transaction data"""
        df, feature_cols = self.prepare_features(transactions)
        
        if df is None or len(df) < 10:
            return {
                'success': False,
                'error': 'Insufficient data for training. Need at least 10 transactions.'
            }
        
        # Prepare training data
        X = df[feature_cols].values
        y = df['amount'].values
        
        # Split data
        if len(df) > 30:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
        else:
            X_train, y_train = X, y
            X_test, y_test = X, y
        
        # Train XGBoost model
        self.model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            objective='reg:squarederror'
        )
        
        self.model.fit(X_train, y_train)
        
        # Evaluate
        train_score = self.model.score(X_train, y_train)
        test_score = self.model.score(X_test, y_test)
        
        return {
            'success': True,
            'train_r2': float(train_score),
            'test_r2': float(test_score),
            'samples_trained': len(X_train),
            'features_used': len(feature_cols)
        }
    
    def predict_optimal_price(self, item_name, month=None, is_wedding_season=False):
        """Predict optimal price for an item"""
        if self.model is None:
            return None
        
        if month is None:
            month = datetime.now().month
        
        # Create feature vector
        item_encoded = self.label_encoder.transform([item_name])[0] if item_name in self.label_encoder.classes_ else 0
        
        # Use current date context
        today = datetime.now()
        day_of_week = today.weekday()
        day_of_month = today.day
        week_of_year = today.isocalendar()[1]
        
        is_festival = 1 if month in [9, 10, 11] else 0
        is_weekend = 1 if day_of_week in [5, 6] else 0
        
        # Use model training data statistics as defaults
        features = np.array([[
            item_encoded, month, day_of_week, day_of_month, week_of_year,
            1 if is_wedding_season else 0, is_festival, is_weekend,
            1000, 200, 1000,  # rolling averages (defaults)
            1000, 200, 10  # item statistics (defaults)
        ]])
        
        predicted_price = self.model.predict(features)[0]
        
        return float(predicted_price)
    
    def generate_recommendations(self, transactions, language='hindi'):
        """Generate comprehensive pricing recommendations"""
        # Train model
        training_result = self.train_model(transactions)
        
        if not training_result['success']:
            return training_result
        
        # Analyze items
        df = pd.DataFrame(transactions)
        df['item'] = df['description'].str.extract(r'(साड़ी|लहंगा|कुर्ती|कुर्ता|दुपट्टा|ब्लाउज|शर्ट|पैंट|ड्रेस)', expand=False)
        df['item'] = df['item'].fillna('अन्य')
        
        # Get unique items with sales
        item_stats = df.groupby('item').agg({
            'amount': ['mean', 'min', 'max', 'count']
        }).reset_index()
        
        item_stats.columns = ['item', 'avg_price', 'min_price', 'max_price', 'total_sales']
        
        # Sort by sales volume to determine increase rates
        item_stats = item_stats.sort_values('total_sales', ascending=False)
        
        # Calculate dynamic max increase percentages based on sales volume
        max_sales = item_stats['total_sales'].max()
        min_sales_threshold = 10  # Minimum sales to consider for increase
        
        recommendations = []
        
        for idx, row in item_stats.iterrows():
            item_name = row['item']
            current_avg = row['avg_price']
            total_sales = row['total_sales']
            
            # Skip items with very low sales (less than threshold)
            if total_sales < min_sales_threshold:
                continue
            
            # Calculate dynamic max increase percentage based on sales volume
            # Top sellers (90%+): 30% max
            # High performers (70%+): 25% max
            # Medium volume (50%+): 20% max
            # Lower medium (30%+): 15% max
            # Low volume: 10% max
            sales_ratio = total_sales / max_sales
            
            if sales_ratio >= 0.9:  # Top sellers
                max_increase_percent = 30
            elif sales_ratio >= 0.7:  # High performers
                max_increase_percent = 25
            elif sales_ratio >= 0.5:  # Medium sellers
                max_increase_percent = 20
            elif sales_ratio >= 0.3:  # Lower medium
                max_increase_percent = 15
            else:  # Low sellers but above threshold
                max_increase_percent = 10
            
            # Predict optimal price for current month
            optimal_price = self.predict_optimal_price(item_name)
            
            if optimal_price is None:
                continue
            
            # Calculate the maximum price we can recommend based on sales volume cap
            max_recommended_price = current_avg * (1 + max_increase_percent / 100)
            
            # If ML predicts higher than our cap, use the cap
            if optimal_price > max_recommended_price:
                optimal_price = max_recommended_price
            # If ML predicts lower, but we can increase more based on sales volume, increase to cap
            elif optimal_price < current_avg:
                # Item is already priced well according to ML, but high sales volume justifies increase
                optimal_price = max_recommended_price
            
            # Predict for wedding season
            wedding_price = self.predict_optimal_price(item_name, month=11, is_wedding_season=True)
            
            # Calculate differences
            price_diff = optimal_price - current_avg
            percent_diff = (price_diff / current_avg) * 100
            
            # Estimate potential increase (based on actual sales volume)
            potential_monthly = max(0, price_diff * min(total_sales, 10))
            
            # Determine priority and reason (conservative approach)
            if percent_diff > 20:
                priority = 'high'
                reason = f'कीमत {percent_diff:.0f}% बढ़ाएं (धीरे-धीरे)। यह आइटम अच्छा बिकता है।'
            elif percent_diff > 10:
                priority = 'medium'
                reason = f'कीमत {percent_diff:.0f}% बढ़ाने की सिफारिश।'
            elif percent_diff > 5:
                priority = 'low'
                reason = f'थोड़ी कीमत बढ़ाएं ({percent_diff:.0f}%)।'
            else:
                priority = 'low'
                reason = 'आपकी कीमत बाजार के अनुसार है।'
            
            recommendations.append({
                'name': item_name,
                'currentPrice': float(current_avg),
                'suggestedPrice': float(optimal_price),
                'weddingSeasonPrice': float(wedding_price),
                'priceDifference': float(price_diff),
                'percentDifference': float(percent_diff),
                'reason': reason,
                'priority': priority,
                'totalSales': int(total_sales),
                'potentialMonthlyIncrease': float(potential_monthly),
                'minPrice': float(row['min_price']),
                'maxPrice': float(row['max_price'])
            })
        
        # Sort by potential increase
        recommendations.sort(key=lambda x: x['potentialMonthlyIncrease'], reverse=True)
        
        # Calculate insights
        total_potential = sum(r['potentialMonthlyIncrease'] for r in recommendations)
        avg_underpricing = np.mean([r['percentDifference'] for r in recommendations if r['percentDifference'] > 0])
        
        # Generate message in appropriate language
        if language == 'english':
            message = f"According to XGBoost model ({training_result['test_r2']:.2%} accuracy), adjusting prices could yield ₹{total_potential:.0f}/month additional profit."
        else:
            message = f"XGBoost मॉडल ({training_result['test_r2']:.2%} सटीकता) के अनुसार कीमतें समायोजित करने से ₹{total_potential:.0f}/माह अतिरिक्त लाभ हो सकता है।"
        
        insights = {
            'totalPotentialIncrease': float(total_potential),
            'averageUnderpricing': float(avg_underpricing) if not np.isnan(avg_underpricing) else 0,
            'modelAccuracy': float(training_result['test_r2']),
            'itemsAnalyzed': len(recommendations),
            'message': message
        }
        
        return {
            'success': True,
            'recommendations': recommendations,
            'insights': insights,
            'modelMetrics': {
                'train_r2': training_result['train_r2'],
                'test_r2': training_result['test_r2'],
                'samples': training_result['samples_trained']
            }
        }


def main():
    """Main entry point for CLI usage"""
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python xgboost_pricing.py <transactions_json or @filepath>'
        }))
        sys.exit(1)
    
    # Parse transactions from command line argument or file
    try:
        transactions_arg = sys.argv[1]
        language = 'hindi'  # Default language
        
        # Check if argument is a file path (starts with @)
        if transactions_arg.startswith('@'):
            filepath = transactions_arg[1:]
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Check if data has language field
                if isinstance(data, dict) and 'language' in data:
                    language = data.get('language', 'hindi')
                    transactions = data.get('transactions', [])
                else:
                    transactions = data
        else:
            data = json.loads(transactions_arg)
            if isinstance(data, dict) and 'language' in data:
                language = data.get('language', 'hindi')
                transactions = data.get('transactions', [])
            else:
                transactions = data
            
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': f'Invalid input: {str(e)}'
        }))
        sys.exit(1)
    
    # Create advisor and generate recommendations
    advisor = PricingAdvisor()
    result = advisor.generate_recommendations(transactions, language)
    
    # Output JSON result with UTF-8 encoding
    if sys.stdout.encoding != 'utf-8':
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
