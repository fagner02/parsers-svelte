call npm run build 
call npx cap sync android
cd android
call gradlew assembleDebug
cd ..
call npm run tauri build
call npm run tauri build -- --target i686-pc-windows-msvc
