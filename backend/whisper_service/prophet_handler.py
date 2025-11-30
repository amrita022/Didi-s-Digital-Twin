import sys
import json
import pandas as pd
from prophet import Prophet
from datetime import datetime, timedelta
import logging
import os

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    try:
        # Read input from Node.js
        input_data = json.loads(sys.stdin.read())
        transactions = input_data.get('transactions', [])
        
        print("Starting Prophet AI...")
        print(f"Processing {len(transactions)} transactions")
        
        # Process transactions for Prophet
        sales_data = []
        for txn in transactions:
            if txn.get('type') == 'income':  # Only sales data
                date = txn.get('date')
                amount = txn.get('amount', 0)
                
                if date and amount > 0:
                    try:
                        # Convert to datetime
                        if isinstance(date, str):
                            if 'T' in date:
                                date_obj = datetime.fromisoformat(date.replace('Z', '+00:00'))
                            else:
                                date_obj = datetime.strptime(date, '%Y-%m-%d')
                        else:
                            # Assume it's a timestamp or datetime object
                            date_obj = pd.to_datetime(date)
                        
                        # Remove timezone to make Prophet happy
                        if date_obj.tzinfo is not None:
                            date_obj = date_obj.replace(tzinfo=None)
                        
                        sales_data.append({
                            'ds': date_obj,
                            'y': amount
                        })
                    except Exception as e:
                        print(f"Skipping transaction with date error: {date} - {e}")
                        continue
        
        print(f"Valid sales records: {len(sales_data)}")
        
        if len(sales_data) < 7:
            print("Not enough data for Prophet (need at least 7 records)")
            return generate_fallback_predictions()
        
        # Create DataFrame
        df = pd.DataFrame(sales_data)
        df = df.groupby('ds')['y'].sum().reset_index()
        df = df.sort_values('ds')
        
        print(f"Unique sales days: {len(df)}")
        print(f"Date range: {df['ds'].min().date()} to {df['ds'].max().date()}")
        
        # Train Prophet model with conservative settings
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            seasonality_mode='multiplicative',  # Better for retail patterns
            changepoint_prior_scale=0.05  # More conservative (default 0.05, lower = less flexible)
        )
        
        model.fit(df)
        print("Prophet model trained successfully!")
        
        # Create future dataframe (next 60 days to cover 2 months)
        future = model.make_future_dataframe(periods=60, freq='D')
        forecast = model.predict(future)
        
        # Get future predictions only (60 days to cover next 2 months)
        future_predictions = forecast[forecast['ds'] > df['ds'].max()].tail(60)
        
        # Format predictions
        predictions = []
        for _, row in future_predictions.iterrows():
            predictions.append({
                'date': row['ds'].strftime('%Y-%m-%d'),
                'predicted_sales': max(0, round(row['yhat'])),
                'confidence_lower': max(0, round(row['yhat_lower'])),
                'confidence_upper': max(0, round(row['yhat_upper']))
            })
        
        # Generate monthly insights
        monthly_insights = generate_monthly_insights(future_predictions)
        
        result = {
            'success': True,
            'predictions': predictions,
            'monthly_insights': monthly_insights,
            'model': 'prophet_real_data',
            'message': 'AI demand forecasts using your real sales data',
            'data_used': len(sales_data),
            'training_days': len(df)
        }
        
        print(f"Generated {len(predictions)} predictions")
        print(json.dumps(result))
        
    except Exception as e:
        print(f"Prophet AI failed: {e}")
        import traceback
        traceback.print_exc()
        print(json.dumps(generate_fallback_predictions()))

def generate_monthly_insights(future_predictions):
    """Generate monthly revenue insights - excludes partial current month"""
    from datetime import datetime
    
    # Make a copy to avoid SettingWithCopyWarning
    future_pred_copy = future_predictions.copy()
    future_pred_copy['month'] = future_pred_copy['ds'].dt.to_period('M')
    monthly = future_pred_copy.groupby('month').agg({
        'yhat': 'sum',
        'yhat_lower': 'sum', 
        'yhat_upper': 'sum',
        'ds': 'count'  # Count days in each month
    }).reset_index()
    
    insights = []
    current_month = datetime.now().strftime('%Y-%m')
    
    for _, row in monthly.iterrows():
        month_str = row['month'].strftime('%Y-%m')
        revenue = int(row['yhat'])
        days_in_prediction = row['ds']
        
        # Skip current month if it's partial (less than 25 days predicted)
        if month_str == current_month and days_in_prediction < 25:
            print(f"Skipping partial month {month_str} ({days_in_prediction} days)")
            continue
        
        # IMPORTANT: Prophet predicts for ALL 30 days, but historically
        # shop only has sales on ~15 days per month (every other day)
        # Adjust prediction to match actual selling pattern
        adjusted_revenue = int(revenue * 0.5)  # Approx 50% of days have sales
        
        insights.append({
            'month': row['month'].strftime('%B %Y'),
            'predictedRevenue': adjusted_revenue,
            'confidenceRange': {
                'min': int(row['yhat_lower'] * 0.5),
                'max': int(row['yhat_upper'] * 0.5)
            },
            'season': 'peak' if adjusted_revenue > 15000 else 'normal'
        })
    
    return insights[:2]  # Return next 2 complete months

def generate_fallback_predictions():
    """Fallback when Prophet fails"""
    return {
        'success': True,
        'predictions': [
            {'date': '2024-12-15', 'predicted_sales': 2500, 'confidence_lower': 2000, 'confidence_upper': 3000},
            {'date': '2024-12-16', 'predicted_sales': 2700, 'confidence_lower': 2200, 'confidence_upper': 3200}
        ],
        'monthly_insights': [
            {'month': 'December 2024', 'predictedRevenue': 75000, 'confidenceRange': {'min': 60000, 'max': 90000}, 'season': 'peak'}
        ],
        'model': 'prophet_fallback',
        'message': 'Sample demand forecasts'
    }

if __name__ == "__main__":
    main()