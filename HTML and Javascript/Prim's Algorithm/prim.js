
/// Javascript implementation of Prim's Algorithm ///

////////////////////////////////////////////////////////////////////////////////////////////////////

/// Classes ///


class Vector2 {
	#x;
	#y;

	constructor( _x, _y ) {
		this.#x = _x;
		this.#y = _y;
	}

	get x() {
		return this.#x;
	}

	get y() {
		return this.#y;
	}
}


// Graph Vertex
class Vertex {
	#pos; // type: Vector2
	
	#neighbors = new Set();
	
	constructor() {
		// generate (x, y) values ranging from -0.5 (inclusively) to 0.5 (exclusively)
		this.#pos = new Vector2( Math.random() - 0.5, Math.random() - 0.5 );
	}

	addNeighbor( _vertex ) {
		this.#neighbors.add( _vertex );
	}
	
	get pos() {
		return this.#pos;
	}

	get neighborCount() {
		return this.#neighbors.size;
	}

	// return set of neighbors as an array
	get neighbors() {
		return Array.from( this.#neighbors );
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////

/// Functions ///


// get the shortest euclidean distance ab where a is in the tree and b is outside the tree,
// then add b to the tree
function GrowTree( _outsideTree, _insideTree ) {
	let minCost = Infinity;
	let tempCost;
	let bestCandidate_inside;
	let bestCandidate_outside;
	let posA;
	let posB;

	for( let i = 0; i < _insideTree.length; i++ ) {
		for( let j = 0; j < _outsideTree.length; j++ ) {
			posA = _insideTree[ i ].pos;
			posB = _outsideTree[ j ].pos;
			tempCost = Math.sqrt( Math.pow((posA.x - posB.x), 2) + Math.pow((posA.y - posB.y), 2) );

			if( tempCost < minCost ) {
				minCost = tempCost;
				bestCandidate_inside = _insideTree[ i ];
				bestCandidate_outside = _outsideTree[ j ];
			}
		}
	}

	bestCandidate_inside.addNeighbor( bestCandidate_outside ); // Only one of the two candidates has their neighbor set updated, to avoid overdraw during rendering
	_insideTree.push( bestCandidate_outside );
	let pos = _outsideTree.indexOf( bestCandidate_outside );
	_outsideTree.splice( pos, 1 );
}


function PrimAlgorithm( _numberOfVertices, _vertexPositions, _lineSegPositions ) {
	var vertices_outsideTree= [];
	var vertices_inTree= [];

	for( let i = 0; i < _numberOfVertices; i++ ) {
		vertices_outsideTree.push( new Vertex() );
	}

	// select random vertex to grow tree from
	let pos = Math.floor( Math.random() * _numberOfVertices );
	vertices_inTree.push( vertices_outsideTree[ pos ] );
	vertices_outsideTree.splice( pos, 1 );

	do {
		GrowTree( vertices_outsideTree, vertices_inTree );
	} while ( vertices_outsideTree.length > 0 );


	// create array information which can be fed into point and lineSeg shaderSource
	
	for( let i = 0; i < vertices_inTree.length; i++ ) {
		_vertexPositions.push( vertices_inTree[ i ].pos.x );
		_vertexPositions.push( vertices_inTree[ i ].pos.y );
	}


	for( let i = 0; i < vertices_inTree.length; i++ ) {
		let neighbors = vertices_inTree[ i ].neighbors;
		for( let j = 0; j < neighbors.length; j++ ) {
			_lineSegPositions.push( vertices_inTree[ i ].pos.x );
			_lineSegPositions.push( vertices_inTree[ i ].pos.y );
			_lineSegPositions.push( neighbors[ j ].pos.x );
			_lineSegPositions.push( neighbors[ j ].pos.y );
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////

/// Shader Code and Programs ///


// Point shader codes, for rendering vertices as Points

var pointVertexCode =
	"attribute vec4 coordinates;" +
	"void main() {" +
		"gl_Position = coordinates;" +
		"gl_PointSize = 10.0;" +
	"}";

var pointFragmentCode =
	"precision mediump float;" +
	"void main(void) {" +
		"gl_FragColor = vec4(0.0, 1, 0.1, 1);" +
	"}";


// used to hold the reference to the resulting program associated
// with the point shader codes
var pointProgram;


// Line Segment shader codes, for rendering edges

var lineSegVertexCode =
	"attribute vec4 coordinates;" +
	"void main(void) {" +
		"gl_Position = coordinates;"+
	"}";

var lineSegFragmentCode =
	"void main(void) {" +
		"gl_FragColor = vec4(1.0, 0.0, 1.0, 0.2);" +
	"}";


// used to hold the reference to the resulting program associated
// with the line segment shader codes
var lineSegProgram;


function CreateProgram( _gl, _vertexShaderCode, _fragmentShaderCode ) {
	var vertexShader = _gl.createShader( _gl.VERTEX_SHADER );
	_gl.shaderSource( vertexShader, _vertexShaderCode );
	_gl.compileShader( vertexShader );

	var fragmentShader = _gl.createShader( _gl.FRAGMENT_SHADER );
	_gl.shaderSource( fragmentShader, _fragmentShaderCode );
	_gl.compileShader( fragmentShader );

	var program = _gl.createProgram();

	_gl.attachShader( program, vertexShader );
	_gl.attachShader( program, fragmentShader );
	_gl.linkProgram( program );

	return program;
}


function ClearScreen( _gl ) {
	_gl.clearColor( 0.2, 0.0, 0.2, 1.0 );
	_gl.clear( _gl.COLOR_BUFFER_BIT );
}


function DrawPoints( _gl, _program, _pointArray ) {
	var coordAttributeLocation = _gl.getAttribLocation( _program, "coordinates");
	var coordBuffer = _gl.createBuffer();

	_gl.bindBuffer( _gl.ARRAY_BUFFER, coordBuffer );
	_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( _pointArray ), _gl.STATIC_DRAW );

	_gl.useProgram( _program );
	_gl.enableVertexAttribArray( coordAttributeLocation );

	_gl.vertexAttribPointer( coordAttributeLocation, 2, _gl.FLOAT, false, 0, 0 );

	_gl.drawArrays( _gl.POINTS, 0, _pointArray.length / 2 );

	_gl.bindBuffer( _gl.ARRAY_BUFFER, null);
}


function DrawLineSegs( _gl, _program, _lineSegArray ) {
	var coordAttributeLocation = _gl.getAttribLocation( _program, "coordinates");
	var coordBuffer = _gl.createBuffer();
	_gl.bindBuffer( _gl.ARRAY_BUFFER, coordBuffer );
	_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( _lineSegArray), _gl.STATIC_DRAW );

	_gl.useProgram( _program );
	_gl.enableVertexAttribArray( coordAttributeLocation );

	_gl.vertexAttribPointer( coordAttributeLocation, 2, _gl.FLOAT, false, 0, 0 );

	_gl.drawArrays( _gl.LINES, 0, _lineSegArray.length / 2 );

	_gl.bindBuffer( _gl.ARRAY_BUFFER, null);
}

////////////////////////////////////////////////////////////////////////////////////////////////////

/// Main ///

function Main() {
	var canvas = document.querySelector("#glcanvas");
	var gl = canvas.getContext("webgl");

	if( gl === null ) {
		alert(
		  "Unable to initialize WebGL. Your browser or machine may not support it."
		);
		return;
	}

	gl.viewport( 0, 0, canvas.width, canvas.height );

	ClearScreen( gl );

	var vertexPositions = [];
	var lineSegPositions = [];

	PrimAlgorithm( 32, vertexPositions, lineSegPositions );

	// prepare shader programs
	pointProgram = CreateProgram( gl, pointVertexCode, pointFragmentCode );
	lineSegProgram = CreateProgram( gl, lineSegVertexCode, lineSegFragmentCode );

	DrawLineSegs( gl, lineSegProgram, lineSegPositions );
	DrawPoints(gl, pointProgram, vertexPositions);
}

Main();