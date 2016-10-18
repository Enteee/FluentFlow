/**
 * FluentFlow matching core
 * @author Timo
 * @author Enteee  <ducksource@duckpond.ch>
 * 
 * Classes:
 *   Rule : immutable({ check: f(context, prev, forget, match), next: Rule })
 *   State: { immutable(rule: Rule), immutable(prev: []), context: {}}
 *
 * Constructor:
 *   states = [new State { rule: firstRule, prev: [], context: {} }]
 *
 * matchNext(obj, [1]):
 *   thorw error if isMatching
 *   isMatching = true
 *   checkRunning = 0
 *   obj = immutable(obj)
 *   forgettables = []
 *
 *   For each state in states (parallel):
 *     checkRunning++
 *     matchCalled = false
 *     state.rule.check.apply({
 *         obj: obj,
 *         prev: state.prev,
 *         context: state.context,
 *       },
 *       // arguments
 *       forget,
 *       function () {
 *         throw error if matchCalled
 *         matchCalled = true
 *         match.apply(this, [obj, state].concat(arguments))
 *       }
 *     )
 *
 * Callbacks:
 *   match(obj, state, match):
 *     iff match:
 *       states.push(new State {
 *         rule: state.rule.next,
 *         prev: [obj].concat(state.prev),
 *         prevContext: immutable(state.context),
 *         context: {}
 *       })
 *     iff checkRunning == 0:
 *       For each state in states iff state.prev contains one of forgettables (parallel):
 *         states.remove(state)
 *       isMatching = false
 *       call [1]
 *
 *   forget(objs):
 *     forgettables = forgettables.concat(objs)
 *
 */
const async = require('async');
const _ = require('lodash');
const immutable = require('immutable');


/**     Rule : immutable({ check: f(context, prev, forget, match), next: Rule })
 */

module.exports = (function (log, error) {
  if(!_.isFunction(log)) throw new Error('log must be function');
  if(!_.isFunction(error)) throw new Error('error must be function');

  const log = (log) ? log : () => {};
  const error = (errro) ? error : console.error;


  return function () {
    const chains = Array.prototype.slice.call(arguments);
    const states = [];
    if ( !(_.isArray(chains) && _.every(chains, (chain) => _.isArray(chain) && _.every(chain, _.isFunction))) ) throw new Error('chains must be array of array of functions'); };

    function Rule (check, next) {
      if ( !_.isFunction(check) ) throw new Error('check must be function');
      if ( ! (next instanceof Rule) ) throw new Error('next must be Rule');

      this.check = immutable.Map(check);
      this.rule = immutable.Map(rule);

    }

    /**
     *  State class 
     * State: { immutable(rule: Rule), immutable(prev: []), immutable(prevContext: {}) context: {}}
     */
    function State (rule, prevState) {
      prevState = prevState || {};

      this.rule = rule;
      this.prev = immutable.Map(prevState.prev || []);
      this.prevContext = immutable.Map(prevState.context || {});
      this.context = {};

    };

 * Constructor:
 *   states = [new State { rule: firstRule, prev: [], context: {} }]
 *
 * matchNext(obj, [1]):
 *   thorw error if isMatching
 *   isMatching = true
 *   checkRunning = 0
 *   obj = immutable(obj)
 *   forgettables = []
 *
 *   For each state in states (parallel):
 *     checkRunning++
 *     matchCalled = false
 *     state.rule.check.apply({
 *         obj: obj,
 *         prev: state.prev,
 *         context: state.context,
 *       },
 *       // arguments
 *       forget,
 *       function () {
 *         throw error if matchCalled
 *         matchCalled = true
 *         match.apply(this, [obj, state].concat(arguments))
 *       }
 *     )
 *
 * Callbacks:
 *   match(obj, state, match):
 *     iff match:
 *       states.push(new State {
 *         rule: state.rule.next,
 *         prev: [obj].concat(state.prev),
 *         prevContext: immutable(state.context),
 *         context: {}
 *       })
 *     iff checkRunning == 0:
 *       For each state in states iff state.prev contains one of forgettables (parallel):
 *         states.remove(state)
 *       isMatching = false
 *       call [1]
 *
 *   forget(objs):
 *     forgettables = forgettables.concat(objs)
 *
    var isMatching = false;
    this.matchNext = function (object, cb) {
      cb = cb || function () {};
      if (typeof (cb) !== 'function') throw new Error('Callback must be a function');
      if (isMatching) throw new Error('Call to matchNext while the previous call has not returned');

      isMatching = true;
      var cbOriginal = cb;
      cb = function(){
        isMatching = false;
        cbOriginal();
      };

      /**
       * recursive rule checking function
       * @param rule rule to check
       * @param state checking state
       * @cb function(err)
       */
      function checkRule (rule, obj, cb) {

        state = state || {
          current: null,

          param: null,
          cleanCurrent: null,
        }

        // 'this' object inside rule
        var context = {
        };

        // Function that calls all callbacks of a ruleDef and pushes objects into following queues
        function afterMatch (params) {
          var copy = state.params.slice(); // make one copy for all action handlers
          async.each(ruleDef.actions, function (action, cb) {
            action.apply(context, copy.concat(cb));
          }, function (err) {
            if (err) return cb(err);
            if (ruleDef.pushTo.length > 0) {
              ruleDef.pushTo.forEach(function (toWhere) {
                pushObjectTo(ruleId, toWhere, params.slice()); // make one copy per ruleDef
              }
            }
          });
        };

        // Function that will be called when all checker function's returned true
        // Calls the callbacks and marks the async task's as finished
        function endCheck () {
          if (!!state.param) {
            log('match on rule ' + ruleId + ' with param', param);
            afterMatch(param); // Call action, apply pushTo and unpushTo
            if (context.cleanCurrent) { // param must be removed
              var i = ruleDef.params.indexOf(param2remove);
              if (i >= 0) { // param has not been removed by checker/action yet
                ruleDef.params.splice(i, 1); // remove argument from ruleDef because it matched
              }
            }
          } else {
            log('match on rule ' + ruleId);
            if (ruleDef.params.length === 0) { // No "Arguments" available. Call action only once. No cleaning afterwards
              afterMatch([object]);
            } else { // Arguments available. Call action once per argument
              var prevCleanCurrent = context.cleanCurrent;
              var copy = ruleDef.params.slice();
              while (copy.length > 0) {
                var par2remove = copy.shift(); // remove first element
                context.cleanCurrent = prevCleanCurrent;
                context.current = par2remove;
                var par = par2remove.slice(); // make a copy of it
                par.unshift(object); // add object front
                afterMatch(par);
                if (context.cleanCurrent) {
                  var k = ruleDef.params.indexOf(par2remove);
                  if (k >= 0) { // param has not been removed by checker/action yet
                    ruleDef.params.splice(k, 1); // remove argument from ruleDef because it matched
                  }
                }
              }
            }
          }
          if (asyncMode) {
            asyncDone(); // mark rule check task as finished
          }
        };

        // Function that calls the next checker function and validates it's return value
        function checkNext (checker, args) {
          var cbCalled = false; // var that says whether or not the checker function has yet returned (sync OR async !!)
          // push callback
          args.push(function (matched) {
            matched = (typeof matched !== 'undefined') ? matched : true;

            if (cbCalled) {
              throw new Error('You can not call next() multiple times, or after you function returned a boolean');
            }
            cbCalled = true;
            if (matched) continueCheck();
          };

          try {
            checker.apply(context, args);
          } catch (e) {
            return addRuntimeException(e);
          }
        };

        // Function that executes the next step of checking of this rule or ends the checking with endCheck()
        function continueCheck () {
          // was last checker ?
          if (checkerInd === ruleDef.checkers.length) return endCheck();

          var checker = ruleDef.checkers[checkerInd++]; // get current checker and increment for next round
          hasParam = hasParam || (checker.length > 1 && ruleDef.params.length > 0); // if the checker takes more than one argument, and we have more than one object to pass
          if (!hasParam) {
            checkNext(checker, [object]);
          } else if (param === undefined) {
            var params = ruleDef.params.slice(); // shadow copy, so that array will not shrink
            for (var paramInd = 0; paramInd < params.length; paramInd++) { // foreach param
              var par = params[paramInd].slice(); // copy param!
              par.unshift(object); // add object front
              log('try to match rule ' + ruleId + ' with args', par);
              checkRule(ruleDef, par, checkerInd - 1, params[paramInd], context.cleanCurrent);
            }
          } else {
            checkNext(checker, param);
          }
        };

        continueCheck(); // Start checking with the first checker
      };

      // check all rules
      async.each(this.rules, function(rule, cb){
        if (rule.conditional && rule.params.length <= 0) return cb(); // Rule must not be processed
        checkRule(rule, null, cb); // check one rule (async)
      }, cb);
    };
  };

  obj.Rule = function (rules, actions) {
    rules = [].concat(rule || function (cb) { cb(); });
    actions = [].concat(action || function (cb) { cb(); });
    if(_.some(rules, _.negate(_.isFunction))) throw new Error('Rules must be function(s)');
    if(_.some(actions, _.negate(_.isFunction))) throw new Error('Actions must be function(s)');
   

    this.queu = []; // params objects (one entry = array of matches along the chain), those params shall be passed down the chain and to the action handlers
    this.queuSize = 
    
    this.checkers = rule ? [rule] : []; // rule check functions. First parameter: Current Object, Second Parameter: array of the previous objects down the chain
    this.actions = action ? [action] : []; // action handler functions which will be called on match. First parameter: Current Object, Second Parameter: array of the previous objects down the chain
    this.pushTo = []; // ruleid of rules to which params to push matches to. An entry "3" will push the all matches to the params of rule 3.
  };

}());
