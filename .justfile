default:
    @just --list

# create zip package
build:
    mkdir -p build
    gnome-extensions pack --force -o build

install:
    gnome-extensions install --force build/pomodoro-widget@atareao.es.shell-extension.zip

clean:
    rm -rf build
