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

import Adw from "gi://Adw";
import Gio from "gi://Gio";

import {
    ExtensionPreferences,
    gettext as _,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class PomodoroWidgetPreferences extends ExtensionPreferences{
  fillPreferencesWindow(window) {
    window._settings = this.getSettings();
    window.search_enabled = true;
    window.set_default_size(800, 600);

    const page = Adw.PreferencesPage.new();
    page.set_title(_("Pomodoro Widget"));
    page.set_name("pomodoro-widget-preferences");

    const group = Adw.PreferencesGroup.new();
    group.set_title(_("Pomodoros"));
    group.set_name("pomodoros_group");

    const number_of_pomodoros = Adw.SpinRow.new_with_range(1, 10, 1);
    number_of_pomodoros.set_title(_("Number of pomodoros"));
    number_of_pomodoros.set_name("number-of-pomodoros");
    window._settings.bind("pomodoros", number_of_pomodoros, "active", Gio.SettingsBindFlags.DEFAULT);
    group.add(number_of_pomodoros);

    const pomodoro_length = Adw.SpinRow.new_with_range(1, 60, 1);
    pomodoro_length.set_title(_("Pomodoro length"));
    pomodoro_length.set_name("pomodoro-length");
    window._settings.bind("pomodoro-length", pomodoro_length, "active", Gio.SettingsBindFlags.DEFAULT);
    group.add(pomodoro_length);

    page.add(group);
    window.add(page);
  }
};

