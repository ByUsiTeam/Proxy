@echo off
go get golang.org/x/mobile/bind
gomobile init
@REM gomobile bind -target=android
gomobile bind -target=android -androidapi 21