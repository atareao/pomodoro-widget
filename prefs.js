/*
 * since-indicator@atareao.es
 *
 * Copyright (c) 2022 Lorenzo Carbonell Cerezo <a.k.a. atareao>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

const {GLib, GObject, Gio, Gtk, Gdk} = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();
const Widgets = Extension.imports.preferenceswidget;
const AboutPage = Extension.imports.aboutpage.AboutPage;
const Gettext = imports.gettext.domain(Extension.uuid);
const _ = Gettext.gettext;

function init() {
    ExtensionUtils.initTranslations();
}

var PomodoroWidgetPreferencesWidget = GObject.registerClass(
    class PomodoroWidgetPreferencesWidget extends Widgets.ListWithStack{
        _init(){
            super._init();

            let preferencesPage = new Widgets.Page();

            var settings = ExtensionUtils.getSettings();

            let pomodoroSection = preferencesPage.addFrame(
                _("Pomodoro options"));

            pomodoroSection.addGSetting(settings, "pomodoros");
            pomodoroSection.addGSetting(settings, "pomodoro-length");
            pomodoroSection.addGSetting(settings, "short-break-length");
            pomodoroSection.addGSetting(settings, "long-break-length");
            pomodoroSection.addGSetting(settings, "auto-start-breaks");
            pomodoroSection.addGSetting(settings, "auto-start-pomodoros");
            pomodoroSection.addGSetting(settings, "lock-widget");

            this.add(_("Pomodoro Widget Preferences"),
                     "preferences-other-symbolic",
                     preferencesPage);
            this.add(_("About"), "help-about-symbolic", new AboutPage());
        }
    }
);

function buildPrefsWidget() {
    let preferencesWidget = new PomodoroWidgetPreferencesWidget();
    preferencesWidget.connect("realize", ()=>{
        const window = preferencesWidget.get_root();
        window.set_title(_("Pomodoro Widget Configuration"));
        window.default_height = 800;
        window.default_width = 850;
    });
    return preferencesWidget;
}
