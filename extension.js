/*
 * pomodoro-widget@atareao.es
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

const {Clutter, Gio, GLib, GObject, Meta, Pango, Shell, St} = imports.gi;

const MessageTray = imports.ui.messageTray;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const DND = imports.ui.dnd;

const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();
const PieChart = Extension.imports.piechart.PieChart;

const Gettext = imports.gettext.domain(Extension.uuid);
const _ = Gettext.gettext;

var PomodoroWidget = GObject.registerClass(
    class PomodoroWidget extends St.BoxLayout {
        _init() {
            super._init({
                vertical: true,
                reactive: true,
                track_hover: true,
                can_focus: true,
            });

            this._settings = ExtensionUtils.getSettings();
            this._menuManager = new PopupMenu.PopupMenuManager(this);

            this._stationLabel = new St.Label({
                x_align: Clutter.ActorAlign.CENTER,
                y_align: Clutter.ActorAlign.CENTER,
            });
            const fontDesc = Pango.font_description_from_string("Ubuntu");
            const textStyle = `font-family: "${fontDesc.get_family()}";`;
            this._stationLabel.style = `font-size: 20pt;` + 'font-feature-settings: "tnum";' + textStyle;
            this.add_child(this._stationLabel);

            let container = new St.BoxLayout({
                vertical: false,
                reactive: false,
                track_hover: false
            });
            this.add_child(container);
            this._pomodoroPieChart = new PieChart(280, 280, 45, "25");
            container.add_child(this._pomodoroPieChart);

            let down_buttons = new St.BoxLayout({
                vertical: false,
                reactive: true,
                track_hover: true,
                can_focus: true
            });
            this._previousButton = new St.Button({
                label: _("Previous"),
                styleClass: "pomodoro-button",
                x_align: Clutter.ActorAlign.CENTER,
                y_align: Clutter.ActorAlign.CENTER,
                x_expand: true,
            });
            this._previousButton.connect("clicked", ()=>{
                if(this._running == -1){
                    this.play();
                }
                this._running -= 1;
                if(this._running < 0){
                    this._running = this._pomodoros * 2 - 1;
                }
                this.setRunning(this._running);
                this.setElapsed(0);
                this._startStopButton.set_label(_("Stop"));
                this._startTime = GLib.DateTime.new_now_utc().add_minutes(-this._elapsed);
                this.update();
            });
            down_buttons.add_child(this._previousButton);
            this._startStopButton = new St.Button({
                label: _("Start"),
                styleClass: "pomodoro-button",
                x_align: Clutter.ActorAlign.CENTER,
                y_align: Clutter.ActorAlign.CENTER,
                x_expand: true,
            });
            this._startStopButton.connect("clicked", ()=>{
                if(this._running == -1){
                    this.play();
                }else{
                    this.stop();
                }
            });
            down_buttons.add_child(this._startStopButton);
            this._nextButton = new St.Button({
                label: _("Next"),
                styleClass: "pomodoro-button",
                x_align: Clutter.ActorAlign.CENTER,
                y_align: Clutter.ActorAlign.CENTER,
                x_expand: true,
            });
            this._nextButton.connect("clicked", ()=>{
                if(this._running == -1){
                    this.play();
                }
                this._running += 1;
                if(this._running > this._pomodoros * 2 - 1){
                    this._running = 0;
                }
                this.setRunning(this._running);
                this.setElapsed(0);
                this._startStopButton.set_label(_("Stop"));
                this._startTime = GLib.DateTime.new_now_utc().add_minutes(-this._elapsed);
                this.update();
            });
            down_buttons.add_child(this._nextButton);
            this.add_child(down_buttons);

            this._time = new St.Label({
                x_align: Clutter.ActorAlign.CENTER,
                y_align: Clutter.ActorAlign.CENTER,
            });
            this._time.clutter_text.set({
                ellipsize: Pango.EllipsizeMode.NONE,
            });

            this._date = new St.Label({
                x_align: Clutter.ActorAlign.CENTER,
                y_align: Clutter.ActorAlign.CENTER,
            });
            this._date.clutter_text.set({
                ellipsize: Pango.EllipsizeMode.NONE,
            });

            this.connect('notify::hover', () => this._onHover());
            this.connect('destroy', this._onDestroy.bind(this));

            if(!this._settings.get_boolean('lock-widget'))
                this.makeDraggable();

            //this.update();
            //this.setTextStyle();
            //this.setLabelPositions();
            //this.setStyle();

            // this._settings.connect('changed::text-color', () => pomodoroWidget.setTextStyle());
            // this._settings.connect('changed::text-shadow', () => pomodoroWidget.setTextStyle());
            // this._settings.connect('changed::time-font-size', () => pomodoroWidget.setTextStyle());
            // this._settings.connect('changed::date-font-size', () => pomodoroWidget.setTextStyle());
            // this._settings.connect('changed::font-family', () => pomodoroWidget.setTextStyle());

            //this._settings.connect('changed::widget-border', () => pomodoroWidget.setStyle());
            //this._settings.connect('changed::widget-background', () => pomodoroWidget.setStyle());

            this._connections = [];
            this._connections.push(this._settings.connect('changed::location', () => this.setPosition()));

            //this._settings.connect('changed::time-date-inline', () => pomodoroWidget.setLabelPositions());
            //this._settings.connect('changed::time-date-order', () => pomodoroWidget.setLabelPositions());

            this._connections.push(this._settings.connect('changed::date-format', () => this.update()));
            this._connections.push(this._settings.connect('changed::lock-widget', () => this.makeDraggable()));
            this.loadPreferences()
            if(this._running > -1){
                this.play();
            }
        }

        _getMetaRectForCoords(x, y){
            this.get_allocation_box();
            let rect = new Meta.Rectangle();

            [rect.x, rect.y] = [x, y];
            [rect.width, rect.height] = this.get_transformed_size();
            return rect;
        }

        _getWorkAreaForRect(rect){
            let monitorIndex = global.display.get_monitor_index_for_rect(rect);
            return Main.layoutManager.getWorkAreaForMonitor(monitorIndex);
        }

        _isOnScreen(x, y){
            let rect = this._getMetaRectForCoords(x, y);
            let monitorWorkArea = this._getWorkAreaForRect(rect);

            return monitorWorkArea.contains_rect(rect);
        }

        _keepOnScreen(x, y){
            let rect = this._getMetaRectForCoords(x, y);
            let monitorWorkArea = this._getWorkAreaForRect(rect);

            let monitorRight = monitorWorkArea.x + monitorWorkArea.width;
            let monitorBottom = monitorWorkArea.y + monitorWorkArea.height;

            x = Math.min(Math.max(monitorWorkArea.x, x), monitorRight - rect.width);
            y = Math.min(Math.max(monitorWorkArea.y, y), monitorBottom - rect.height);

            return [x, y];
        }

        setPosition(){
            if(this._ignorePositionUpdate)
                return;

            let [x, y] = this._settings.get_value('location').deep_unpack();
            this.set_position(x, y);

            if(!this.get_parent())
                return;

            if(!this._isOnScreen(x, y)){
                [x, y] = this._keepOnScreen(x, y);

                this.ease({
                    x,
                    y,
                    duration: 150,
                    mode: Clutter.AnimationMode.EASE_OUT_QUAD
                });

                this._ignorePositionUpdate = true;
                this._settings.set_value('location', new GLib.Variant('(ii)', [x, y]));
                this._ignorePositionUpdate = false;
            }
        }

        setRunning(value){
            this._running = value;
            this._settings.set_value('running', new GLib.Variant('i', value));
        }

        setElapsed(value){
            this._settings.set_value('elapsed', new GLib.Variant('i', value));
        }

        stop(){
            this.setRunning(-1);
            this._startStopButton.set_label(_("Start"));
            this._stationLabel.set_text(_("Stopped"));
            this._pomodoroPieChart.setText("-");
            this._pomodoroPieChart.setPercentage(0);
            this._pomodoroPieChart.setColor(this._pomodoroColor);
            this._pomodoroPieChart.redraw();
            if(this._counter){
                GLib.source_remove(this._counter);
                this._counter = null;
            }
        }

        play(){
            if(this._counter){
                GLib.source_remove(this._counter);
                this._counter = null;
            }
            if(this._running == -1){
                this.setRunning(0);
            }
            this._startStopButton.set_label(_("Stop"));
            this._startTime = GLib.DateTime.new_now_utc().add_minutes(-this._elapsed);
            this.update();
            this._counter = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, ()=>{
                return this.update();
            });
        }

        update() {
            if(this._running < 0){
                return false;
            }
            let current = GLib.DateTime.new_now_utc();
            let diff = Math.round(current.difference(this._startTime) / 1000000 / 60);
            this.setElapsed(diff);
            let station;
            let text;
            let percentage;
            let color;
            if(this._running < this._pomodoros * 2 - 1){
                if(this._running % 2 == 0){
                    // In a pomodoro
                    if(diff <= this._pomodoroLength){
                        text = this._pomodoroLength - diff;
                        percentage = Math.round(diff/this._pomodoroLength * 100);
                        station = _("Pomodoro") + " #" + String(Math.round(this._running / 2) + 1);
                        color = this._pomodoroColor;
                    }else{
                        this.setRunning(this._running + 1);
                        this.setElapsed(0);
                        this._startTime = GLib.DateTime.new_now_utc();
                        if(this._running < this._pomodoros * 2 - 1 && this._running % 2 != 0){
                            text = this._shortBreakLength;
                            station = _("Short break") + " #" + String(Math.round(this._running / 2) + 1);
                            color = this._shortBreakColor;
                        }else{
                            text = this._longBreakLength;
                            station = _("Long break");
                            color = this._longBreakColor;
                        }
                        percentage = 0;
                    }
                }else{
                    // In a short break
                    if(diff <= this._shortBreakLength){
                        text = this._shortBreakLength - diff;
                        percentage = Math.round(diff/this._shortBreakLength * 100);
                        station = _("Short break") + " #" + String(Math.round(this._running / 2) + 1);
                        color = this._shortBreakColor;
                    }else{
                        this.setRunning(this._running + 1);
                        this.setElapsed(0);
                        this._startTime = GLib.DateTime.new_now_utc();
                        text = this._pomodoroLength;
                        percentage = 0;
                        station = _("Pomodoro") + " #" + String(Math.round(this._running / 2) + 1);
                        color = this._pomodoroColor;
                    }
                }
            }else{
                // In a long break
                if(diff <= this._longBreakLength){
                    text = this._longBreakLength - diff;
                    percentage = Math.round(diff/this._longBreakLength * 100);
                    station = _("Long break");
                    color = this._longBreakColor;
                }else{
                    this.stop();
                    return false;
                }
            }
            this._pomodoroPieChart.setText(text);
            this._pomodoroPieChart.setPercentage(percentage);
            this._pomodoroPieChart.setColor(color);
            this._pomodoroPieChart.redraw();
            this._stationLabel.set_text(station);
            this.queue_redraw();
            return true;
        }

        loadPreferences(){
            this._running = this._settings.get_int("running");
            this._elapsed = this._settings.get_int("elapsed");
            this._pomodoros = this._settings.get_int("pomodoros");
            this._pomodoroLength = this._settings.get_int("pomodoro-length");
            this._shortBreakLength = this._settings.get_int("short-break-length");
            this._longBreakLength = this._settings.get_int("long-break-length");
            this._autoStartBreaks = this._settings.get_int("auto-start-breaks");
            this._autoStartPomodoros = this._settings.get_int("auto-start-pomodoros");
            this._pomodoroColor = this._settings.get_string("pomodoro-color");
            this._shortBreakColor = this._settings.get_string("short-break-color");
            this._longBreakColor = this._settings.get_string("long-break-color");
        }

        vfunc_button_press_event() {
            let event = Clutter.get_current_event();

            if (event.get_button() === 1)
                this._setPopupTimeout();
            else if (event.get_button() === 3) {
                this._popupMenu();
                return Clutter.EVENT_STOP;
            }

            return Clutter.EVENT_PROPAGATE;
        }

        _onDragBegin() {
            if(this._menu)
                this._menu.close(true);
            this._removeMenuTimeout();

            this.isDragging = true;
            this._dragMonitor = {
                dragMotion: this._onDragMotion.bind(this)
            };
            DND.addDragMonitor(this._dragMonitor);

            let p = this.get_transformed_position();
            this.startX = this.oldX = p[0];
            this.startY = this.oldY = p[1];

            this.get_allocation_box();
            this.rowHeight = this.height;
            this.rowWidth = this.width;
        }

        _onDragMotion(dragEvent) {
            this.deltaX = dragEvent.x - ( dragEvent.x - this.oldX );
            this.deltaY = dragEvent.y - ( dragEvent.y - this.oldY );

            let p = this.get_transformed_position();
            this.oldX = p[0];
            this.oldY = p[1];

            return DND.DragMotionResult.CONTINUE;
        }

        _onDragEnd() {
            if (this._dragMonitor) {
                DND.removeDragMonitor(this._dragMonitor);
                this._dragMonitor = null;
            }

            this._settings.set_value('location', new GLib.Variant('(ii)', [this.deltaX, this.deltaY]));
        }

        getDragActorSource() {
            return this;
        }

        makeDraggable(){
            this._draggable = DND.makeDraggable(this);
            this._draggable._animateDragEnd = (eventTime) => {
                this._draggable._animationInProgress = true;
                this._draggable._onAnimationComplete(this._draggable._dragActor, eventTime);
            };
            this.dragBeginId = this._draggable.connect('drag-begin', this._onDragBegin.bind(this));
            this.dragEndId = this._draggable.connect('drag-end', this._onDragEnd.bind(this));
        }

        _onHover() {
            if(!this.hover)
                this._removeMenuTimeout();
        }

        _removeMenuTimeout() {
            if (this._menuTimeoutId > 0) {
                GLib.source_remove(this._menuTimeoutId);
                this._menuTimeoutId = 0;
            }
        }

        _setPopupTimeout() {
            this._removeMenuTimeout();
            this._menuTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 600, () => {
                this._menuTimeoutId = 0;
                this._popupMenu();
                return GLib.SOURCE_REMOVE;
            });
            GLib.Source.set_name_by_id(this._menuTimeoutId, '[azclock] this.popupMenu');
        }

        _popupMenu() {
            this._removeMenuTimeout();

            if (!this._menu) {
                this._menu = new PopupMenu.PopupMenu(this, 0.5, St.Side.TOP);
                let lockWidgetItem = this._menu.addAction('', () => {
                    this._menu.close();
                    this._settings.set_boolean('lock-widget', !this._settings.get_boolean('lock-widget'));
                });

                lockWidgetItem.label.text = this._settings.get_boolean('lock-widget') ? _("Unlock") : _("Lock");

                this._menu.addAction(_("Pomodoro Widget Settings"), () => {
                    ExtensionUtils.openPrefs();
                });

                Main.uiGroup.add_actor(this._menu.actor);
                this._menuManager.addMenu(this._menu);
            }

            this._menu.open();
            return false;
        }

        _onDestroy() {
            this.stop();
        }

        destroy(){
            this._connections.forEach(connection => {
                this._settings.disconnect(connection);
            });
            this._connections = null;
            super.destroy()
        }
    }
);


let pomodoroWidget;

function init(){
    ExtensionUtils.initTranslations();
}

function enable() {
    if(Meta.is_wayland_compositor()){
        Extension.metadata.isWayland = true;
    }else{
        Extension.metadata.isWayland = false;
    }
    pomodoroWidget = new PomodoroWidget();
    pomodoroWidget.set_pivot_point(0.5, 0.5);

    /*
    * Widget needs to be above wallpaper and below any active windows.
    */
    Main.layoutManager._backgroundGroup.add_child(pomodoroWidget);
    pomodoroWidget.setPosition();
}

function disable() {
    pomodoroWidget.destroy();
    pomodoroWidget = null;
}
