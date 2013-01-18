var should = require('should'),
    grunt = require('grunt'),
    jsdom = require('jsdom'),
    precompiler = require('../tasks/lib/precompiler');

describe('A compiled template', function() {
  var myView, renderedView;

  before(function(done) {
    var vendorDir      = __dirname + '/vendor',
        jQueryJs       = grunt.file.read(vendorDir + '/jquery-1.7.2.js', 'utf8'),
        handlebarsJs   = grunt.file.read(vendorDir + '/handlebars-1.0.rc.1.js'),
        emberJs        = grunt.file.read(vendorDir + '/ember.js', 'utf8'),
        exampleFile    = grunt.file.read('test/example.handlebars'),
        compiledSrc    = precompiler.precompile(exampleFile),
        templatedSrc   = 'Ember.TEMPLATES.example = '+
                         'Ember.Handlebars.template('+compiledSrc+');';

    jsdom.env({
      html: '<div id="test"></div>',
      src: [
        jQueryJs,
        handlebarsJs,
        emberJs,
        templatedSrc
      ],

      done: function(errors, window) {
        var $ = window.jQuery,
            Ember = window.Ember;

        var MyView = Ember.View.extend({
          templateName: 'example'
        });

        myView = MyView.create({
          value: 'baz',

          context: Ember.Object.create({
            subcontext: Ember.Object.create({ value: 'foo' }),
            value: 'bar'
          })
        });

        Ember.run(function() {
          myView.appendTo('#test');
        });

        renderedView = $('#test').text();
        done();
      }
    });
  });

  it('renders view values', function() {
    renderedView.should.include(myView.get('value'));
  });

  it('renders context values', function() {
    renderedView.should.include(myView.get('context.value'));
  });

  it('renders subcontexts values', function() {
    renderedView.should.include(myView.get('context.subcontext.value'));
  });
});
