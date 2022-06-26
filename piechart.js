const {GObject, Clutter, St, Pango, PangoCairo} = imports.gi;
const Cairo = imports.cairo;

var PieChart = GObject.registerClass(
    class PieChart extends Clutter.Actor{
        _init(width, height, percentage, text, color='#00FF00'){
            super._init({
                x_expand: true,
                x_align: Clutter.ActorAlign.CENTER,
                y_align: Clutter.ActorAlign.CENTER,
            });
            this._width = width;
            this._height = height;
            this._percentage = percentage;
            this._text = text;
            this.setColor(color);
            this._canvas = new Clutter.Canvas();
            this._canvas.set_size(width, height);
            this._canvas.connect('draw', (canvas, cr, width, height)=>{
                this._draw(canvas, cr, width, height);
            });
            this.redraw();
            this.set_content(this._canvas);
            this.set_size(width, height);
        }

        setWidth(width){
            this._width = width;
        }

        setHeight(height){
            this._height = height;
        }

        setPercentage(percentage){
            this._percentage = percentage;
        }
        getPercentage(){
            return this._percentage;
        }

        setColor(color){
            this._color = Clutter.Color.from_string(color)[1];
        }

        setText(text){
            this._text = String(text);
        }

        redraw(){
            this._canvas.invalidate();
        }

        _draw(canvas, cr, width, height){
            // Clear the canvas
            cr.save();
            cr.setOperator(Cairo.Operator.CLEAR);
            cr.paint();
            cr.restore();
            cr.setOperator(Cairo.Operator.OVER);
            let linew = width * 0.2;
            // Begin to paint
            cr.save();
            cr.setLineWidth(linew);
            Clutter.cairo_set_source_color(cr, new Clutter.Color({
                red: 60,
                blue: 60,
                green: 60,
                alpha: 255
            }));
            cr.arc((width) / 2,
                   (height) / 2,
                   parseInt((width - linew) / 2 * 0.8),
                   0, 2 * Math.PI)
            cr.stroke();
            cr.restore();
            cr.save();
            cr.setLineWidth(linew);
            Clutter.cairo_set_source_color(cr, this._color);
            const start = -Math.PI/2.0;
            const end = 2.0 * Math.PI * this._percentage/100.0 + start;
            cr.arc((width) / 2,
                   (height) / 2,
                   parseInt((width - linew) / 2 * 0.8),
                   start,
                   end);
            cr.stroke();
            cr.restore();

            cr.save();
            Clutter.cairo_set_source_color(
                cr,
                new Clutter.Color({
                red: 255,
                blue: 255,
                green: 255,
                alpha: 255
                }));
            this._write_centered_text(cr, width/2, height/2, this._text,
                                      'Ubuntu', '40');
            cr.restore();
            cr.$dispose();
        }

        _write_centered_text(cr, x, y, text, font, size){
            let pg_layout = PangoCairo.create_layout(cr);
            let pg_context = pg_layout.get_context();
            pg_layout.set_font_description(
                Pango.FontDescription.from_string('%s %s'.format(font, size)));
            pg_layout.set_text(text, -1);

            PangoCairo.update_layout(cr, pg_layout);
            let text_size = pg_layout.get_pixel_size();

            cr.moveTo(x - text_size[0]/3, y + text_size[1]/4);
            cr.setFontSize(size);
            cr.showText(text);
        }
    }
);
