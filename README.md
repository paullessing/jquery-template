# jquery-template
Simple templating engine using jQuery

`jquery-template` is a simple jQuery templating engine.
It uses the `data-template` attribute to identify template blocks, removes the parent from the DOM,
and returns a Template object which can be used to create new instances.

## Usage
To include `jquery-template`, just include the file in your HTML after the jQuery initialisation.
You need jQuery version 1.2.3 or higher.

Suppose you have the following markup, for a list of chat messages:
```html
<ul id="message-list">
    <li class="message template">
        <div class="title">
            <span data-template="time">00:00</span>
            <span data-template="name">Username</span>
        </div>
        <div class="content" data-template="message">Lorem ipsum dolor sit amet</div>
    </li>
</ul>
```
To create the template, you call
```js
var template = $('.message.template').template();
```
Creating the template will remove the element from the DOM and strip the `template` CSS class, so you will be left with:
```html
<ul id="message-list"></ul>
```
To create a new instance, you call:
```js
var instance = template.create({
    time: '12:00',
    name: 'Username',
    message: "Hi! I'm a message!"
});
$('#message-list').append(instance);

// Or, shorthand:
template.create(true, { // "true" parameter attaches the element to the template parent
    time: '12:00',
    name: 'User',
    message: "Hi! I'm a message!"
});
```
Output:
```html
<ul id="message-list">
    <li class="message">
        <div class="title">
            <span>12:00</span>
            <span>User</span>
        </div>
        <div class="content">Hi! I'm a message!</div>
    </li>
</ul>
```
## Parameters
The `create()` function takes two parameters:

`insertInPlace` (boolean, optional):
If set to `true`, the new template instance will be inserted where the old template was.
If it's `false` or omitted, the function will simply return a jQuery DOM object for you to insert.

`data` (object):
Key-value pairs corresponding to the `data-template` attributes in the template. There are multiple supported types of value:
* `string`: Value is inserted using `$.text()` (as an escaped String).
* `function`: The function is called without arguments to retrieve the value.
        This allows deferring calculation of values until the time of creation of the instance.
        The function is only called once per instance, even if there are multiple elements matching;
        they will all have the same value. The function should return a value that would be a valid type:
        `string`, `function` (which would be called again), or `object` (see below for specification).
* `object`: These must have a single key, one of the following:
 * `text` (string): Same as passing a string directly. Text will be escaped.
 * `html` (string): Value will be treated as HTML, and inserted using jQuery's `.html()` method.
 * `callback` (function): This function should have signature `callback($elements)` and will be called
                once, with `$elements` being a jQuery object containing all matching elements in the instance.<br />
                No result is expected, the function should modify the content directly.
If the value matches none of these specifications, the element is blanked.

If the `data` object contains no key for an element with a `data-template` attribute, the element is not touched.

## Unit tests
There are extensive unit tests, simply open the `test/test.html` file in a browser to see the results.

## License
Licensed under the MIT license.
