;(function () {
	'use strict'
	
	angular
		.module('angular-deck', []);
		
}.call(this));

;(function () {
	'use strict'

	angular
		.module('angular-deck')

		.constant('SUITS', ['S', 'H', 'C', 'D'])
		.constant('FULL_VALUES', ['2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K', 'A'])
		.constant('STANDART_VALUES', ['6', '7', '8', '9', '0', 'J', 'Q', 'K', 'A'])

		.constant('DECK_TYPES', ['FULL', 'STANDART'])
		.constant('DECK_TYPE_DEFAULT', 'FULL')
		.constant('DECK_TYPE_FULL', 'FULL')
		.constant('DECK_TYPE_STANDART', 'STANDART')

		.constant('SHIRTS_CARD', ['RED', 'BLUE'])
		.constant('SHIRT_CARD_DEFAULT', 'RED')
		.constant('SHIRT_CARD_RED', 'RED')
		.constant('SHIRT_CARD_BLUE', 'BLUE')

}.call(this));

;(function () {
	'use strict'

	angular
		.module('angular-deck')
		.constant('CARD_PATH', 'templates/cards/%%CARD_NAME%%.svg')

}.call(this));

;(function () {
	'use strict'

	angular
		.module('angular-deck')
		.directive('card', cardDirective);

	cardDirective.$inject = ['DeckService', 'SHIRT_CARD_DEFAULT'];

	function cardDirective (DeckService, SHIRT_CARD_DEFAULT) {

		return {
			restrict: 'E',
			scope: {
				value: '=?'
			},
			link: link
		};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		function link ($scope, element, attrs) {
			$scope.$watch('value', function (newValue, oldValue) {
				var new_card = DeckService.name.normalize(newValue),
					old_card = DeckService.name.normalize(oldValue);

				new_card = new_card ? new_card : SHIRT_CARD_DEFAULT;
				old_card = old_card ? old_card : SHIRT_CARD_DEFAULT;

				$(element).removeClass('card' + old_card);
				$(element).addClass('card' + new_card);
			})
		}
	}

})();

;(function () {
	'use strict'

	angular
		.module('angular-deck')
		.factory('Deck', Deck);

	Deck.$inject = ['DeckService', 'SUITS', 'FULL_VALUES', 'STANDART_VALUES', 'DECK_TYPES', 'DECK_TYPE_DEFAULT'];


	function Deck (DeckService, SUITS, FULL_VALUES, STANDART_VALUES, DECK_TYPES, DECK_TYPE_DEFAULT) {
		var deckFactory;

		deckFactory = DeckConstractor;
		deckFactory.getRandomCard = getRandomCard;

		return deckFactory;
		
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		function DeckConstractor () {
			var newInstance = getDeck.apply(null, arguments);

			newInstance.shuffle = shuffle;

			return newInstance;
		}

		function shuffle () {
			var deck = this,
				n = deck.length;

			while (n--) {
				deck = deck.sort(function () {
					return Math.random() > Math.random();
				});
			}

			return this;
		}
		
		function getDeck () {
			console.log('DeckService', DeckService);
			var type = DeckService.type.get.apply(null, arguments),
				newDeck = [];

			switch (type) {

				case 'STANDART':
					STANDART_VALUES.forEach(function (value) {
						SUITS.forEach(function (suit) {
							var name = suit + value,
								normalize = DeckService.name.normalize(name);

							newDeck.push(normalize);
						});
					});
					break;

				case 'FULL':
				default:
					FULL_VALUES.forEach(function (value) {
						SUITS.forEach(function (suit) {
							var name = suit + value,
								normalize = DeckService.name.normalize(name);

							newDeck.push(normalize);
						});
					});
			}

			return newDeck;
		}

		function getRandomCard () {
			return DeckConstractor.apply(Object.create(DeckConstractor.prototype), arguments).shuffle()[0];
		}

	}

}.call(this));

;(function () {
	'use strict'
	
	angular
		.module('angular-deck')
		.run(cardSVGRun);

	cardSVGRun.$inject = ['CARD_PATH', 'SHIRTS_CARD', 'Deck'];

	function cardSVGRun (CARD_PATH, SHIRTS_CARD, Deck) {

		var style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = 'card { width: 225px; height: 315px; display: inline-block;}';

		(new Deck)
			.filter(function (card) { return typeof card === 'string'; })
			.concat(SHIRTS_CARD)
			.forEach(function (card_name) {
				style.innerHTML += '\n.card%CARD_NAME% { background: url("%CARD_PATH%"); background-size: 100% }'
					.replace('%CARD_NAME%', card_name).replace('%CARD_PATH%', CARD_PATH.replace('%%CARD_NAME%%', card_name));
			});

		$('head')[0].appendChild(style);
	}

})();

;(function () {
	'use strict'
	
	angular
		.module('angular-deck')
		.service('DeckService', DeckService);

	DeckService.$inject = ['CARD_PATH', 'SUITS', 'FULL_VALUES', 'STANDART_VALUES', 'DECK_TYPES', 'DECK_TYPE_DEFAULT'];

	function DeckService (CARD_PATH, SUITS, FULL_VALUES, STANDART_VALUES, DECK_TYPES, DECK_TYPE_DEFAULT) {
		return {
			name: {
				normalize: service_name_normalize
			},
			type: {
				get: service_type_get
			}
		}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		function service_name_normalize (name) {

			if (angular.isString(name) === false || 1 > name.length || name.length > 3) return false;

			if (name.length === 3) {
				if (name.slice(0, 2) === '10') name = '0' + name.splice(-1);
				if (name.slice(1, 3) === '10') name = '0' + name.splice(0, 1);
			}

			if (name.length === 2) {
				var a = name[0].toUpperCase(),
					b = name[1].toUpperCase();

				if (SUITS.indexOf(a) !== -1 && FULL_VALUES.indexOf(b) !== -1) return b + a;
				if (SUITS.indexOf(b) !== -1 && FULL_VALUES.indexOf(a) !== -1) return a + b;
			}

			return false;
		}

		function service_type_get () {
			var type = (arguments[0] || '').toUpperCase();
			return (DECK_TYPES.indexOf(type) !== -1) ? DECK_TYPE_DEFAULT : type;
		}
	}

})();
