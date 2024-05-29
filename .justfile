default:
    @just --list

# create zip package
build:
    mkdir -p build
    gnome-extensions pack --force -o build

# compile preferences
compile:
    glib-compile-schemas ./schemas/

install:
    gnome-extensions install --force build/pomodoro-widget@atareao.es.shell-extension.zip

clean:
    rm -rf build
