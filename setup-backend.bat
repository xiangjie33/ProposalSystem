@echo off
echo Setting up Laravel Backend...
cd proposal-system-backend

echo Running migrations...
php artisan migrate

echo Seeding database...
php artisan db:seed --class=RolePermissionSeeder

echo Creating storage link...
php artisan storage:link

echo Backend setup complete!
pause
