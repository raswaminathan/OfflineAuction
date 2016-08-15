'use strict';

angular.module('LiarsPoker')
    .service('cardService', function ($http, $q) {

        /******************************************************************************
* Playing Card Objects                                                        *
*                                                                             *
* Do not remove this notice.                                                  *
*                                                                             *
* Copyright 2001 by Mike Hall                                                 *
* Please see http://www.brainjar.com for terms of use.                        *
******************************************************************************/

//=============================================================================
// Card Object
//
// Note: Requires cards.css for display.
//=============================================================================

//-----------------------------------------------------------------------------
// Card constructor function.
//-----------------------------------------------------------------------------

        this.stack = Stack;

        function Card(rank, suit) {

          this.rank = rank;
          this.suit = suit;

          this.toString   = cardToString;
        }

        //-----------------------------------------------------------------------------
        // cardToString(): Returns the name of a card (including rank and suit) as a
        // text string.
        //-----------------------------------------------------------------------------

        function cardToString() {

          var rank, suit;

          switch (this.rank) {
            case "A" :
              rank = "Ace";
              break;
            case "2" :
              rank = "Two";
              break;
            case "3" :
              rank = "Three";
              break;
            case "4" :
              rank = "Four";
              break;
            case "5" :
              rank = "Five";
              break;
            case "6" :
              rank = "Six";
              break;
            case "7" :
              rank = "Seven";
              break;
            case "8" :
              rank = "Eight";
              break;
            case "9" :
              rank = "Nine";
              break;
            case "10" :
              rank = "Ten";
              break;
            case "J" :
              rank = "Jack"
              break;
            case "Q" :
              rank = "Queen"
              break;
            case "K" :
              rank = "King"
              break;
            default :
              rank = null;
              break;
          }

          switch (this.suit) {
            case "C" :
              suit = "Clubs";
              break;
            case "D" :
              suit = "Diamonds"
              break;
            case "H" :
              suit = "Hearts"
              break;
            case "S" :
              suit = "Spades"
              break;
            default :
              suit = null;
              break;
          }

          if (rank == null || suit == null)
            return "";

          return rank + " of " + suit;
        }

        //=============================================================================
        // Stack Object
        //=============================================================================

        //-----------------------------------------------------------------------------
        // Stack constructor function.
        //-----------------------------------------------------------------------------

        function Stack() {

          // Create an empty array of cards.

          this.cards = new Array();

          this.makeDeck  = stackMakeDeck;
          this.shuffle   = stackShuffle;
          this.deal      = stackDeal;
          this.draw      = stackDraw;
          this.addCard   = stackAddCard;
          this.combine   = stackCombine;
          this.cardCount = stackCardCount;
        }

        //-----------------------------------------------------------------------------
        // stackMakeDeck(n): Initializes a stack using 'n' packs of cards.
        //-----------------------------------------------------------------------------

        function stackMakeDeck(n) {

          var ranks = new Array("A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K");
          var suits = new Array("C", "D", "H", "S");
          var i, j, k;
          var m;

          m = ranks.length * suits.length;

          // Set array of cards.

          this.cards = new Array(n * m);

          // Fill the array with 'n' packs of cards.

          for (i = 0; i < n; i++)
            for (j = 0; j < suits.length; j++)
              for (k = 0; k < ranks.length; k++)
                this.cards[i * m + j * ranks.length + k] = new Card(ranks[k], suits[j]);
        }

        //-----------------------------------------------------------------------------
        // stackShuffle(n): Shuffles a stack of cards 'n' times. 
        //-----------------------------------------------------------------------------

        function stackShuffle(n) {

          var i, j, k;
          var temp;

          // Shuffle the stack 'n' times.

          for (i = 0; i < n; i++)
            for (j = 0; j < this.cards.length; j++) {
              k = Math.floor(Math.random() * this.cards.length);
              temp = this.cards[j];
              this.cards[j] = this.cards[k];
              this.cards[k] = temp;
            }
        }

        //-----------------------------------------------------------------------------
        // stackDeal(): Removes the first card in the stack and returns it.
        //-----------------------------------------------------------------------------

        function stackDeal() {

          if (this.cards.length > 0)
            return this.cards.shift();
          else
            return null;
        }

        //-----------------------------------------------------------------------------
        // stackDraw(n): Removes the indicated card from the stack and returns it.
        //-----------------------------------------------------------------------------

        function stackDraw(n) {

          var card;

          if (n >= 0 && n < this.cards.length) {
            card = this.cards[n];
            this.cards.splice(n, 1);
          }
          else
            card = null;

          return card;
        }

        //-----------------------------------------------------------------------------
        // stackAdd(card): Adds the given card to the stack.
        //-----------------------------------------------------------------------------

        function stackAddCard(card) {

          this.cards.push(card);
        }

        //-----------------------------------------------------------------------------
        // stackCombine(stack): Adds the cards in the given stack to the current one.
        // The given stack is emptied.
        //-----------------------------------------------------------------------------

        function stackCombine(stack) {

          this.cards = this.cards.concat(stack.cards);
          stack.cards = new Array();
        }

        //-----------------------------------------------------------------------------
        // stackCardCount(): Returns the number of cards currently in the stack.
        //-----------------------------------------------------------------------------

        function stackCardCount() {

          return this.cards.length;
        }

 });
