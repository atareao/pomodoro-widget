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
 * AUTHORS OR COPYRIGHTCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

import Adw from "gi://Adw";
import {
  ExtensionPreferences,
  gettext as _,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import * as PrefsHelper from "./prefs_helper.js";

export default class PomodoroWidgetPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    window._settings = this.getSettings();
    window.search_enabled = true;
    window.set_default_size(600, 800);

    const page = Adw.PreferencesPage.new();
    page.set_title(_("Pomodoro Widget"));
    page.set_name("pomodoro-widget-preferences");

    page.add(this.buildPomodorosGroup(window));
    page.add(this.buildPomodorosLengthGroup(window));
    page.add(this.buildPomodorosAutoStartGroup(window));
    window.add(page);

    const page_appearance = Adw.PreferencesPage.new();
    page_appearance.set_title(_("Appearance"))
    page_appearance.set_name("pomodoro-appearance");

    page_appearance.add(this.buildPomodorosColor(window));
    page_appearance.add(this.buildPomodorosDimensions(window));
    window.add(page_appearance);
  }

  buildPomodorosGroup(window) {
    const group = Adw.PreferencesGroup.new();
    group.set_title(_("Pomodoros"));
    group.set_name("pomodoros-group");

    group.add(PrefsHelper.buildSpinRow(window, "pomodoros", "Number of pomodoros", 1, 10));
    return group;
  }

  buildPomodorosLengthGroup(window) {
    const group = Adw.PreferencesGroup.new();
    group.set_title(_("Length"));
    group.set_name("pomodoros-length-group");

    group.add(PrefsHelper.buildSpinRow(window, "pomodoro-length", "Pomodoro length", 1, 60));
    group.add(PrefsHelper.buildSpinRow(window, "short-break-length", "Short break length", 1, 60));
    group.add(PrefsHelper.buildSpinRow(window, "long-break-length", "Long break length", 1, 60));
    return group;
  }

  buildPomodorosAutoStartGroup(window) {
    const group = Adw.PreferencesGroup.new();
    group.set_title(_("Auto start"));
    group.set_name("pomodoros-auto-start-group");

    group.add(PrefsHelper.buildSwitchRow(window, "auto-start-breaks", "Auto start breaks"));
    group.add(PrefsHelper.buildSwitchRow(window, "auto-start-pomodoros", "Auto start pomodoros"));
    return group;
  }

  buildPomodorosColor(window) {
    const group = Adw.PreferencesGroup.new();
    group.set_title(_("Colors"));
    group.set_name("pomodoros-colors");

    group.add(PrefsHelper.buildColorRow(window, "pomodoro-background-color",
                                    "Pomodoro background color"));
    group.add(PrefsHelper.buildColorRow(window, "pomodoro-color",
                                    "Pomodoro color"));
    group.add(PrefsHelper.buildColorRow(window, "short-break-color",
                                    "Short break color"));
    group.add(PrefsHelper.buildColorRow(window, "long-break-color",
                                    "Long break color"));
    group.add(PrefsHelper.buildColorRow(window, "pomodoro-border-color",
                                    "Pomodoro border color"));
    group.add(PrefsHelper.buildColorRow(window, "font-color",
                                    "Font color"));
    return group;
  }

  buildPomodorosDimensions(window) {
    const group = Adw.PreferencesGroup.new();
    group.set_title(_("Dimensions"));
    group.set_name("pomodoros-dimensions");

    group.add(PrefsHelper.buildSpinRow(window, "pomodoro-diameter", "Pomodoro diameter", 1, 1000));
    group.add(PrefsHelper.buildSpinRow(window, "pomodoro-width", "Pomodoro width", 1, 1000));
    group.add(PrefsHelper.buildSpinRow(window, "pomodoro-border-width", "Pomodoro border width", 1, 1000));
    group.add(PrefsHelper.buildSpinRow(window, "font-size", "Font size", 1, 100));
    return group;
  }
};

