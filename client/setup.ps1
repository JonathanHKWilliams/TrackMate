# Install required dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan

# Install Node.js dependencies
npm install --save-dev @types/react @types/react-native @types/node typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-native @babel/core @babel/preset-env @babel/preset-typescript @babel/preset-react

# Install project dependencies
npm install @expo/vector-icons @lucide/lab @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs @supabase/supabase-js expo expo-constants expo-font expo-linking expo-router expo-splash-screen expo-status-bar react react-dom react-native react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-screens react-native-svg react-native-url-polyfill

# Create necessary directories
$directories = @(
    "assets",
    "components",
    "constants",
    "hooks",
    "lib",
    "screens",
    "services",
    "store",
    "types",
    "utils"
)

foreach ($dir in $directories) {
    $path = Join-Path -Path $PWD -ChildPath $dir
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Green
    }
}

# Create .env file if it doesn't exist
$envFile = Join-Path -Path $PWD -ChildPath ".env"
if (-not (Test-Path $envFile)) {
    @"
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
"@ | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "Created .env file. Please update it with your Supabase credentials." -ForegroundColor Yellow
}

# Run the asset setup script
Write-Host "Setting up assets..." -ForegroundColor Cyan
node scripts/setup-assets.js

Write-Host "`nSetup complete! Run 'npx expo start' to start the development server." -ForegroundColor Green
