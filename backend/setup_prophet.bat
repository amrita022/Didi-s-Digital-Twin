@echo off
echo ============================================
echo Installing Meta's Prophet for Demand Forecasting
echo ============================================
echo.

cd whisper-env\Scripts
call activate.bat
cd ..\..

echo.
echo Installing Prophet and dependencies...
pip install prophet pandas pystan --upgrade

echo.
echo ============================================
echo Installation Complete!
echo ============================================
echo.
echo Testing Prophet installation...
python -c "from prophet import Prophet; import pandas as pd; print('✅ Prophet installed successfully!')"
echo.
pause
