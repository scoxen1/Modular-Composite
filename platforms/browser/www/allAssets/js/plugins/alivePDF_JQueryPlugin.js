// JavaScript Document

(function( $ ) {
  $.fn.pdf = function( ) { 	  

	if (!window.runtime)  {
		  alert("Window Runtime is not defined!");
		  return this;
	}

	/*In order for us to call classes and methods from library.swf we have to
		always use the full path to it, like: new window.runtime.org.alivepdf.pdf.PDF();
		Let's not do that and create a simple list of aliases that we can extend when
		we need to.
	*/
	
	this.PDF = window.runtime.org.alivepdf.pdf.PDF;
	this.Display = window.runtime.org.alivepdf.display.Display;
	this.Layout = window.runtime.org.alivepdf.layout.Layout;
	this.Orientation = window.runtime.org.alivepdf.layout.Orientation;
	this.Size = window.runtime.org.alivepdf.layout.Size;
	this.Unit = window.runtime.org.alivepdf.layout.Unit;
	this.Download = window.runtime.org.alivepdf.saving.Download;
	this.Method = window.runtime.org.alivepdf.saving.Method;
	this.ImageFormat = window.runtime.org.alivepdf.images.ImageFormat;
	this.ResizeMode = window.runtime.org.alivepdf.images.ResizeMode;
	this.ColorSpace = window.runtime.org.alivepdf.images.ColorSpace;
	this.Resize = window.runtime.org.alivepdf.layout.Resize;
	this.Grid = window.runtime.org.alivepdf.data.Grid;
	this.GridColumn = window.runtime.org.alivepdf.data.GridColumn;
	this.DataGrid = window.runtime.fl.controls.DataGrid;
	this.DataProvider = window.runtime.fl.data.DataProvider;
	this.TextFormat = window.runtime.flash.text.TextFormat;
	this.RGBColor = window.runtime.org.alivepdf.colors.RGBColor;
	this.Fonts = window.runtime.org.alivepdf.fonts;

	 /* PUBLIC methods */

	/* newDocument() - method creates a new alivePDF object
	 *
	 * @param orientation - object alivePDF.Orientation.PORTRAIT
	 * @param unit - object alivePDF.Unit.MM
	 * @param size - object alivePDF.Size.A4
	 * @return this
	 *
	*/
	this.newDocument = function( orientation, unit, size) {
		//Document is a class object reference to alivePDF
		this.Document = new window.runtime.org.alivepdf.pdf.PDF(orientation, unit, size);
		return this;
	};

	/* save() - method saves PDF locally
	 *
	 * @param f - air file object
	 * @return this
	 *
	*/
	this.save = function(f) {
		var fs = new air.FileStream();
		fs.open(f, air.FileMode.WRITE);
		fs.writeBytes(this.Document.save(this.Method.LOCAL));
		fs.close();
		return this;
	};

	/* imageAsBytes() - methods reads local image and returns bytearray
	 *
	 * @param f - air file object
	 * @return this
	 *
	*/
	this.imageAsBytes = function(f) {
		var ba = new air.ByteArray();
		stream = new air.FileStream();
		stream.open(f, air.FileMode.READ);
		stream.readBytes(ba);
		stream.close();
		return ba;
	};


    //Draw a line - wrap the code to perform this action
	this.drawLine = function (x1, y1, x2, y2) {
	    this.Document.moveTo(x1, y1);  //move to starting point
	    this.Document.lineTo(x2, y2); //identify ending point
	    this.Document.end();  //end the line
	    return this;
	};

	return this;
  };
})( jQuery );
