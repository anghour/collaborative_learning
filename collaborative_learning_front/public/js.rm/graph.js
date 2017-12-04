var cy = cytoscape({
	container : document.getElementById('cy'),
	style : [ {
		selector : 'node',

		style : {

			'height' : '60px',
			'width' : '60px',
			'background-color' : '#11479e',
			'color' : 'black',
			'content' : 'data(id)'
		}
	}, {
		selector : 'edge',
		style : {
			'width' : 1,
			'target-arrow-shape' : 'triangle',
			'line-color' : '#9dbaea',
			'target-arrow-color' : '#9dbaea',
			'curve-style' : 'bezier',

		}
	} ],
	elements : {
		nodes : [ {
			data : {
				id : 'n0'
			},
			selectable : true,
			grabbable : false
		}, {
			data : {
				id : 'n1'
			}
		}, {
			data : {
				id : 'n2'
			}
		}, {
			data : {
				id : 'n3'
			}
		}, ],

		edges : [ {
			data : {
				source : 'n0',
				target : 'n1'
			}
		}, {
			data : {
				source : 'n1',
				target : 'n2'
			}
		}, {
			data : {
				source : 'n1',
				target : 'n3'
			}
		}, ]
	},
	layout : {
		name : 'breadthfirst',

		// fit: true, // whether to fit the viewport to the graph
		directed : true, // whether the tree is directed downwards (or edges
							// can point in any direction if false)
		padding : 10, // padding on fit
		// circle: false, // put depths in concentric circles if true, put
		// depths top down if false
		spacingFactor : 1.75 // positive spacing factor, larger => more space
							// between nodes (N.B. n/a if causes overlap)
	// boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or
	// { x1, y1, w, h }
	// avoidOverlap: true, // prevents node overlap, may overflow boundingBox if
	// not enough space
	// nodeDimensionsIncludeLabels: false, // Excludes the label when
	// calculating node bounding boxes for the layout algorithm
	// roots: undefined, // the roots of the trees
	// maximalAdjustments: 0, // how many times to try to position the nodes in
	// a maximal way (i.e. no backtracking)
	// animate: false, // whether to transition the node positions
	// animationDuration: 500, // duration of animation in ms if enabled
	// animationEasing: undefined, // easing of animation if enabled
	// ready: undefined, // callback on layoutready
	// stop: undefined // callback on layoutstop
	}
});