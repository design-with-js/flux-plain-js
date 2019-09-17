(function() {
	// global state:
	var list = { name: "empty list", items: [], q: "" };

	function reducer(state = { name: "empty list", items: [], q: "" }, action) {
		switch (action.type) {
			case "FILTER": {
				return {
					...state,
					items: state.items.filter(
						i => i.name.indexOf(action.q) > -1
					),
					q: action.q
				};
			}

			case "FETCHED":
				return { ...state, name: action.name, items: action.items };

			default:
				return state;
		}
	}

	function dispatch(action) {
		list = reducer(list, action);
		route();
	}

	// Views:
	function View(props) {
		return {
			element: "",
			events: {},
			template: "",
			children: [],
			postRender: undefined,
			...props
		};
	}

	function List(props) {
		function updateList(evt) {
			// queryString, for improvement we can apply debouncing on updateList
			var q = evt.target.value;
			dispatch({ type: "FILTER", q });
		}

		return {
			...props,
			template: `
			<h2>${props.name}</h2>
			<input id="filter" value="${props.q}" />
			<div class="List">
			</div>`,
			children: props.items.map(item => Item({ element: ".List", item })),
			events: {
				"keyup #filter": updateList
			},
			postRender() {
				var input = document.querySelector("#filter");
				input.focus();
				var tmpStr = input.value;
				input.value = "";
				input.value = tmpStr;
			}
		};
	}

	function Item(props) {
		return {
			...props,
			template: `<p>${props.item && props.item.name}</p>`,
			children: [],
			events: {}
		};
	}

	function compose(...functions) {
		return props => functions.reduce((acc, inc) => inc(acc), props);
	}

	Item = compose(
		View,
		Item
	);
	List = compose(
		View,
		List
	);
	//

	var router = {
		"/": List,
		"items/": List,
		"items/:id": Item
	};

	function render(view, isAppending = false) {
		document.querySelector(view.element).innerHTML = isAppending
			? document.querySelector(view.element).innerHTML + view.template
			: view.template;
		for (var v of view.children) {
			render(v, true);
		}

		view.postRender && view.postRender();
	}

	function registerEvents(view) {
		for (var evtKey in view.events) {
			console.log({ evtKey });
			var evtName = evtKey.split(" ")[0];
			var selector = evtKey.split(" ")[1];
			document.querySelector(selector).addEventListener(evtName, evt => {
				view.events[evtKey](evt);
			});
		}

		for (var v of view.children) {
			registerEvents(v);
		}
	}

	function route() {
		var view = List({ ...list, element: "#content" });
		render(view);
		registerEvents(view);
	}

	window.onload = route;

	window.onhashchange = route;

	function api() {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve({
					name: "My List",
					items: [{ name: "item 1" }, { name: "item 2" }]
				});
			}, 0);
		});
	}

	api().then(res => {
		dispatch({ type: "FETCHED", ...res });
	});
})();
