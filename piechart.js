const { GObject, Clutter, St, Pango, PangoCairo } = imports.gi;
const Cairo = imports.cairo;

export const ContentArea = GObject.registerClass({
    GTypeName: "ContentArea",
    Properties: {
      "value": GObject.ParamSpec.int(
        "value",
        "value",
        "the value",
        GObject.ParamFlags.READWRITE,
        0,
        100,
        0
      )
    }
  },
  class ContentArea extends St.DrawingArea {
    _init(params){
      super._init(params);
      this.connect('repaint', this.vfunc_repaint.bind(this));
    }
    redraw(){
      console.log("[PomodoroWidget] => redraw");
      //this.vfunc_repaint();
      this.queue_repaint();
      console.log("[PomodoroWidget] => queue_repaint");
    }

    vfunc_repaint() {
      console.log("[PomodoroWidget] => vfunc_repaint");
      let [width, height] = this.get_surface_size();
      console.log(`[PomodoroWidget] => width: ${width}, height: ${height}`);
      let cr = this.get_context();
      cr.save();
      cr.setOperator(Cairo.Operator.CLEAR);
      cr.paint();
      cr.restore();
      cr.setOperator(Cairo.Operator.OVER);
      let linew = width * 0.2;
      // Begin to paint
      cr.save();
      cr.moveTo(width / 2 + parseInt((width - linew) / 2 * 0.8), height / 2);
      cr.setLineWidth(linew);
      console.log("[PomodoroWidget] => set color");
      const [, bgColor] = Clutter.Color.from_string("#FFAAFF");
      console.log(`[PomodoroWidget] => bgColor: ${bgColor}`);
      cr.setSourceColor(bgColor);
      cr.arc((width) / 2,
        (height) / 2,
        parseInt((width - linew) / 2 * 0.8),
        0, 2 * Math.PI)
      cr.stroke();
      cr.restore();

      cr.save();
      cr.setLineWidth(linew);
      const [, cosa] = Clutter.Color.from_string("#AAFF00");
      console.log(`[PomodoroWidget] => color: ${cosa}`);
      cr.setSourceColor(cosa);
      //Clutter.cairo_set_source_color(cr, this._color);
      const start = -Math.PI / 2.0;
      const end = 2.0 * Math.PI * this._value / 100.0 + start;
      cr.arc((width) / 2,
        (height) / 2,
        parseInt((width - linew) / 2 * 0.8),
        start,
        end);
      cr.stroke();
      cr.restore();

      cr.save();
      const [, color] = Clutter.Color.from_string("#FFFF00");
      console.log(`[PomodoroWidget] => color: ${color}`);
      this._write_centered_text(
        cr,
        width / 2,
        height / 2,
        this.getValue().toString(),
        'Ubuntu',
        '40',
        color
      );
      cr.restore();

      cr.$dispose();
      return true;
    }

    setValue(value) {
      console.log("[PomodoroWidget] => setValue");
      this._value = value;
      this.queue_repaint();
    }

    getValue(){
      return this._value;
    }

    vfunc_get_preferred_height(_forWidth) {
        const themeNode = this.get_theme_node();
        const height = this._getPreferredHeight();
        return themeNode.adjust_preferred_height(height, height);
    }
    
    _getPreferredWidth() {
       return 256;
    }

    _getPreferredHeight() {
      return 256;
    }

    vfunc_get_preferred_width(_forHeight) {
        const themeNode = this.get_theme_node();
        const width = this._getPreferredWidth();
        return themeNode.adjust_preferred_width(width, width);
    }

    _write_centered_text(cr, x, y, text, font, size, color) {
      console.log("[PomodoroWidget] => _write_centered_text");
      let pg_layout = PangoCairo.create_layout(cr);
      let pg_context = pg_layout.get_context();
      pg_layout.set_font_description(
        Pango.FontDescription.from_string('%s %s'.format(font, size)));
      pg_layout.set_text(text, -1);

      PangoCairo.update_layout(cr, pg_layout);
      let text_size = pg_layout.get_pixel_size();

      cr.moveTo(x - text_size[0] / 3, y + text_size[1] / 4);
      cr.setFontSize(size);
      cr.setSourceColor(color);
      cr.showText(text);
    }
  }
);

export const PieChart = GObject.registerClass(
  class PieChart extends Clutter.Actor {
  //class PieChart extends St.Widget {
    _init(width, height, value, text, color = '#00FF00') {
      console.log("[PomodoroWidget] => _init");
      super._init({
        x_expand: true,
        x_align: Clutter.ActorAlign.CENTER,
        y_align: Clutter.ActorAlign.CENTER,
      });
      this._width = width;
      this._height = height;
      this.setColor(color);
      //this._donete = new Donete();
      //this.add_child(this._donete);
      this._content = new ContentArea();
      this.add_child(this._content);
      //this.add_child(new St.DrawingArea());
      /*
      this._vbox = new St.BoxLayout({
        vertical: true,
        y_align: Clutter.ActorAlign.CENTER,
      });
      this._vbox.add_child(this._donete);
      this._canvas = new Clutter.Canvas();
      this._canvas.set_size(width, height);
      this._canvas.connect('draw', (canvas, cr, width, height)=>{
          this._draw(canvas, cr, width, height);
      });
      this.redraw();
      this.set_content(this._canvas);
      */
      this.set_size(width, height);
      this._content.setValue(value);
    }

    setValue(value){
      console.log("[PomodoroWidget] => setValue");
      this._content.setValue(value);
    }

    setWidth(width) {
      console.log("[PomodoroWidget] => setWidth");
      this._width = width;
    }

    setHeight(height) {
      console.log("[PomodoroWidget] => setHeight");
      this._height = height;
    }

    setColor(color) {
      console.log("[PomodoroWidget] => setColor");
      this._color = Clutter.Color.from_string(color)[1];
    }

    redraw() {
      console.log("[PomodoroWidget] => redraw");
      //this._content.redraw();
      //this._donete.queue_repaint();
      //    this._canvas.invalidate();
    }
  }
);
