import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gdk from "gi://Gdk";
import Gtk from "gi://Gtk";
import GLib from "gi://GLib";


export function buildColorRow(window, key, title) {
  const colorParse = new Gdk.RGBA();
  colorParse.parse(window._settings.get_value(key).deep_unpack());

  const colorButton = Gtk.ColorButton.new_with_rgba(colorParse);
  colorButton.add_css_class("colorrowbutton");
  colorButton.connect('color-set', () => {
    const string_color = colorButton.get_rgba().to_string();
    window._settings.set_value(
      key,
      new GLib.Variant("s", string_color)
    );
  });
  const row = Adw.ActionRow.new();
  row.add_suffix(colorButton);
  row.set_title(title);
  row.set_name(key);
  return row;
}

export function buildSpinRow(window, key, title, min_value, max_value) {
  const row = Adw.SpinRow.new_with_range(min_value, max_value, 1);
  row.set_title(title);
  row.set_name(key);
  window._settings.bind(key, row, "value", Gio.SettingsBindFlags.DEFAULT);
  return row;
}

export function buildSwitchRow(window, key, title) {
  const row = Adw.SwitchRow.new();
  row.set_title(title);
  row.set_name(key);
  window._settings.bind(key, row, "active", Gio.SettingsBindFlags.DEFAULT);
  return row;
}
