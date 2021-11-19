
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_options(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            option.selected = ~value.indexOf(option.__value);
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.44.1 */

    function create_fragment$n(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let $location;
    	let $routes;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, 'routes');
    	component_subscribe($$self, routes, value => $$invalidate(6, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(5, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(7, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ['basepath', 'url'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(4, url = $$props.url);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$location,
    		$routes,
    		$base
    	});

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(4, url = $$props.url);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 128) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 96) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$location,
    		$routes,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.44.1 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block$a(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$6, create_else_block$7];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block$7(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, routeParams, $location*/ 532)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$7.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1$6(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('path' in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate(8, path = $$new_props.path);
    		if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
    		if ('routeParams' in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ('routeProps' in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		{
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Link.svelte generated by Svelte v3.44.1 */
    const file$k = "node_modules\\svelte-routing\\src\\Link.svelte";

    function create_fragment$l(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1],
    		/*$$restProps*/ ctx[6]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$k, 40, 0, 1249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let ariaCurrent;
    	const omit_props_names = ["to","replace","state","getProps"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $location;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Link', slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(14, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(13, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('to' in $$new_props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$new_props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$new_props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('$$scope' in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		ariaCurrent,
    		$location,
    		$base
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('to' in $$props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('href' in $$props) $$invalidate(0, href = $$new_props.href);
    		if ('isPartiallyCurrent' in $$props) $$invalidate(11, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
    		if ('isCurrent' in $$props) $$invalidate(12, isCurrent = $$new_props.isCurrent);
    		if ('props' in $$props) $$invalidate(1, props = $$new_props.props);
    		if ('ariaCurrent' in $$props) $$invalidate(2, ariaCurrent = $$new_props.ariaCurrent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 16512) {
    			$$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 8193) {
    			$$invalidate(11, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 8193) {
    			$$invalidate(12, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 4096) {
    			$$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 15361) {
    			$$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		$$restProps,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$location,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {
    			to: 7,
    			replace: 8,
    			state: 9,
    			getProps: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function getOriginalBodyPadding() {
      const style = window ? window.getComputedStyle(document.body, null) : {};

      return parseInt((style && style.getPropertyValue('padding-right')) || 0, 10);
    }

    function getScrollbarWidth() {
      let scrollDiv = document.createElement('div');
      // .modal-scrollbar-measure styles // https://github.com/twbs/bootstrap/blob/v4.0.0-alpha.4/scss/_modal.scss#L106-L113
      scrollDiv.style.position = 'absolute';
      scrollDiv.style.top = '-9999px';
      scrollDiv.style.width = '50px';
      scrollDiv.style.height = '50px';
      scrollDiv.style.overflow = 'scroll';
      document.body.appendChild(scrollDiv);
      const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      return scrollbarWidth;
    }

    function setScrollbarWidth(padding) {
      document.body.style.paddingRight = padding > 0 ? `${padding}px` : null;
    }

    function isBodyOverflowing() {
      return window ? document.body.clientWidth < window.innerWidth : false;
    }

    function conditionallyUpdateScrollbar() {
      const scrollbarWidth = getScrollbarWidth();
      // https://github.com/twbs/bootstrap/blob/v4.0.0-alpha.6/js/src/modal.js#L433
      const fixedContent = document.querySelectorAll(
        '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top'
      )[0];
      const bodyPadding = fixedContent
        ? parseInt(fixedContent.style.paddingRight || 0, 10)
        : 0;

      if (isBodyOverflowing()) {
        setScrollbarWidth(bodyPadding + scrollbarWidth);
      }
    }

    function browserEvent(target, ...args) {
      target.addEventListener(...args);

      return () => target.removeEventListener(...args);
    }

    function toClassName(value) {
      let result = '';

      if (typeof value === 'string' || typeof value === 'number') {
        result += value;
      } else if (typeof value === 'object') {
        if (Array.isArray(value)) {
          result = value.map(toClassName).filter(Boolean).join(' ');
        } else {
          for (let key in value) {
            if (value[key]) {
              result && (result += ' ');
              result += key;
            }
          }
        }
      }

      return result;
    }

    function classnames(...args) {
      return args.map(toClassName).filter(Boolean).join(' ');
    }

    function getTransitionDuration(element) {
      if (!element) return 0;

      // Get transition-duration of the element
      let { transitionDuration, transitionDelay } =
        window.getComputedStyle(element);

      const floatTransitionDuration = Number.parseFloat(transitionDuration);
      const floatTransitionDelay = Number.parseFloat(transitionDelay);

      // Return 0 if element or transition duration is not found
      if (!floatTransitionDuration && !floatTransitionDelay) {
        return 0;
      }

      // If multiple durations are defined, take the first
      transitionDuration = transitionDuration.split(',')[0];
      transitionDelay = transitionDelay.split(',')[0];

      return (
        (Number.parseFloat(transitionDuration) +
          Number.parseFloat(transitionDelay)) *
        1000
      );
    }

    /* node_modules\sveltestrap\src\Accordion.svelte generated by Svelte v3.44.1 */
    const file$j = "node_modules\\sveltestrap\\src\\Accordion.svelte";

    function create_fragment$k(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);
    	let div_levels = [{ class: /*classes*/ ctx[0] }, /*$$restProps*/ ctx[2]];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$j, 29, 0, 643);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*classes*/ 1) && { class: /*classes*/ ctx[0] },
    				dirty & /*$$restProps*/ 4 && /*$$restProps*/ ctx[2]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let classes;
    	const omit_props_names = ["flush","stayOpen","class"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $open;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Accordion', slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { flush = false } = $$props;
    	let { stayOpen = false } = $$props;
    	let { class: className = '' } = $$props;
    	const open = writable();
    	validate_store(open, 'open');
    	component_subscribe($$self, open, value => $$invalidate(8, $open = value));

    	setContext('accordion', {
    		open,
    		stayOpen,
    		toggle: id => {
    			if ($open === id) open.set(); else open.set(id);
    			dispatch('toggle', { [id]: $open === id });
    		}
    	});

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(2, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('flush' in $$new_props) $$invalidate(3, flush = $$new_props.flush);
    		if ('stayOpen' in $$new_props) $$invalidate(4, stayOpen = $$new_props.stayOpen);
    		if ('class' in $$new_props) $$invalidate(5, className = $$new_props.class);
    		if ('$$scope' in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		classnames,
    		createEventDispatcher,
    		setContext,
    		writable,
    		dispatch,
    		flush,
    		stayOpen,
    		className,
    		open,
    		classes,
    		$open
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('flush' in $$props) $$invalidate(3, flush = $$new_props.flush);
    		if ('stayOpen' in $$props) $$invalidate(4, stayOpen = $$new_props.stayOpen);
    		if ('className' in $$props) $$invalidate(5, className = $$new_props.className);
    		if ('classes' in $$props) $$invalidate(0, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, flush*/ 40) {
    			$$invalidate(0, classes = classnames(className, 'accordion', { 'accordion-flush': flush }));
    		}
    	};

    	return [classes, open, $$restProps, flush, stayOpen, className, $$scope, slots];
    }

    class Accordion extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { flush: 3, stayOpen: 4, class: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Accordion",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get flush() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flush(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stayOpen() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stayOpen(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\AccordionHeader.svelte generated by Svelte v3.44.1 */
    const file$i = "node_modules\\sveltestrap\\src\\AccordionHeader.svelte";

    function create_fragment$j(ctx) {
    	let h2;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let h2_levels = [{ class: "accordion-header" }, /*$$restProps*/ ctx[1]];
    	let h2_data = {};

    	for (let i = 0; i < h2_levels.length; i += 1) {
    		h2_data = assign(h2_data, h2_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", /*classes*/ ctx[0]);
    			add_location(button, file$i, 9, 2, 219);
    			set_attributes(h2, h2_data);
    			add_location(h2, file$i, 8, 0, 170);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, button);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*classes*/ 1) {
    				attr_dev(button, "class", /*classes*/ ctx[0]);
    			}

    			set_attributes(h2, h2_data = get_spread_update(h2_levels, [
    				{ class: "accordion-header" },
    				dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let classes;
    	const omit_props_names = ["class"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AccordionHeader', slots, ['default']);
    	let { class: className = '' } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('$$scope' in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ classnames, className, classes });

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(2, className = $$new_props.className);
    		if ('classes' in $$props) $$invalidate(0, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className*/ 4) {
    			$$invalidate(0, classes = classnames(className, 'accordion-button'));
    		}
    	};

    	return [classes, $$restProps, className, $$scope, slots, click_handler];
    }

    class AccordionHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { class: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AccordionHeader",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get class() {
    		throw new Error("<AccordionHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<AccordionHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function backdropIn(node) {
      node.style.display = 'block';

      const duration = getTransitionDuration(node);

      return {
        duration,
        tick: (t) => {
          if (t === 0) {
            node.classList.add('show');
          }
        }
      };
    }

    function backdropOut(node) {
      node.classList.remove('show');
      const duration = getTransitionDuration(node);

      return {
        duration,
        tick: (t) => {
          if (t === 0) {
            node.style.display = 'none';
          }
        }
      };
    }

    function collapseOut(node) {
      node.style.height = `${node.getBoundingClientRect().height}px`;
      node.classList.add('collapsing');
      node.classList.remove('collapse', 'show');
      const duration = getTransitionDuration(node);

      return {
        duration,
        tick: (t) => {
          if (t > 0) {
            node.style.height = '';
          } else if (t === 0) {
            node.classList.remove('collapsing');
            node.classList.add('collapse');
          }
        }
      };
    }

    function collapseIn(node) {
      node.classList.add('collapsing');
      node.classList.remove('collapse', 'show');
      node.style.height = 0;
      const duration = getTransitionDuration(node);

      return {
        duration,
        tick: (t) => {
          if (t < 1) {
            node.style.height = `${node.scrollHeight}px`;
          } else {
            node.classList.remove('collapsing');
            node.classList.add('collapse', 'show');
            node.style.height = '';
          }
        }
      };
    }

    function modalIn(node) {
      node.style.display = 'block';
      const duration = getTransitionDuration(node);

      return {
        duration,
        tick: (t) => {
          if (t > 0) {
            node.classList.add('show');
          }
        }
      };
    }

    function modalOut(node) {
      node.classList.remove('show');
      const duration = getTransitionDuration(node);

      return {
        duration,
        tick: (t) => {
          if (t === 1) {
            node.style.display = 'none';
          }
        }
      };
    }

    const defaultToggleEvents = ['touchstart', 'click'];

    var toggle = (toggler, togglerFn) => {
      let unbindEvents;

      if (
        typeof toggler === 'string' &&
        typeof window !== 'undefined' &&
        document &&
        document.createElement
      ) {
        let selection = document.querySelectorAll(toggler);
        if (!selection.length) {
          selection = document.querySelectorAll(`#${toggler}`);
        }
        if (!selection.length) {
          throw new Error(
            `The target '${toggler}' could not be identified in the dom, tip: check spelling`
          );
        }

        defaultToggleEvents.forEach((event) => {
          selection.forEach((element) => {
            element.addEventListener(event, togglerFn);
          });
        });

        unbindEvents = () => {
          defaultToggleEvents.forEach((event) => {
            selection.forEach((element) => {
              element.removeEventListener(event, togglerFn);
            });
          });
        };
      }

      return () => {
        if (typeof unbindEvents === 'function') {
          unbindEvents();
          unbindEvents = undefined;
        }
      };
    };

    /* node_modules\sveltestrap\src\Collapse.svelte generated by Svelte v3.44.1 */
    const file$h = "node_modules\\sveltestrap\\src\\Collapse.svelte";

    // (57:0) {#if isOpen}
    function create_if_block$9(ctx) {
    	let div;
    	let div_style_value;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);

    	let div_levels = [
    		{
    			style: div_style_value = /*navbar*/ ctx[1] ? undefined : 'overflow: hidden;'
    		},
    		/*$$restProps*/ ctx[8],
    		{ class: /*classes*/ ctx[7] }
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$h, 57, 2, 1471);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "introstart", /*introstart_handler*/ ctx[16], false, false, false),
    					listen_dev(div, "introend", /*introend_handler*/ ctx[17], false, false, false),
    					listen_dev(div, "outrostart", /*outrostart_handler*/ ctx[18], false, false, false),
    					listen_dev(div, "outroend", /*outroend_handler*/ ctx[19], false, false, false),
    					listen_dev(
    						div,
    						"introstart",
    						function () {
    							if (is_function(/*onEntering*/ ctx[2])) /*onEntering*/ ctx[2].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div,
    						"introend",
    						function () {
    							if (is_function(/*onEntered*/ ctx[3])) /*onEntered*/ ctx[3].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div,
    						"outrostart",
    						function () {
    							if (is_function(/*onExiting*/ ctx[4])) /*onExiting*/ ctx[4].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div,
    						"outroend",
    						function () {
    							if (is_function(/*onExited*/ ctx[5])) /*onExited*/ ctx[5].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16384)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*navbar*/ 2 && div_style_value !== (div_style_value = /*navbar*/ ctx[1] ? undefined : 'overflow: hidden;')) && { style: div_style_value },
    				dirty & /*$$restProps*/ 256 && /*$$restProps*/ ctx[8],
    				(!current || dirty & /*classes*/ 128) && { class: /*classes*/ ctx[7] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, collapseIn, {});
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, collapseOut, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(57:0) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[20]);
    	let if_block = /*isOpen*/ ctx[0] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "resize", /*onwindowresize*/ ctx[20]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let classes;

    	const omit_props_names = [
    		"isOpen","class","navbar","onEntering","onEntered","onExiting","onExited","expand","toggler"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Collapse', slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { isOpen = false } = $$props;
    	let { class: className = '' } = $$props;
    	let { navbar = false } = $$props;
    	let { onEntering = () => dispatch('opening') } = $$props;
    	let { onEntered = () => dispatch('open') } = $$props;
    	let { onExiting = () => dispatch('closing') } = $$props;
    	let { onExited = () => dispatch('close') } = $$props;
    	let { expand = false } = $$props;
    	let { toggler = null } = $$props;

    	onMount(() => toggle(toggler, e => {
    		$$invalidate(0, isOpen = !isOpen);
    		e.preventDefault();
    	}));

    	let windowWidth = 0;
    	let _wasMaximized = false;

    	// TODO wrong to hardcode these here - come from Bootstrap CSS only
    	const minWidth = {};

    	minWidth['xs'] = 0;
    	minWidth['sm'] = 576;
    	minWidth['md'] = 768;
    	minWidth['lg'] = 992;
    	minWidth['xl'] = 1200;

    	function notify() {
    		dispatch('update', isOpen);
    	}

    	function introstart_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function introend_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function outrostart_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function outroend_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function onwindowresize() {
    		$$invalidate(6, windowWidth = window.innerWidth);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(8, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('isOpen' in $$new_props) $$invalidate(0, isOpen = $$new_props.isOpen);
    		if ('class' in $$new_props) $$invalidate(9, className = $$new_props.class);
    		if ('navbar' in $$new_props) $$invalidate(1, navbar = $$new_props.navbar);
    		if ('onEntering' in $$new_props) $$invalidate(2, onEntering = $$new_props.onEntering);
    		if ('onEntered' in $$new_props) $$invalidate(3, onEntered = $$new_props.onEntered);
    		if ('onExiting' in $$new_props) $$invalidate(4, onExiting = $$new_props.onExiting);
    		if ('onExited' in $$new_props) $$invalidate(5, onExited = $$new_props.onExited);
    		if ('expand' in $$new_props) $$invalidate(10, expand = $$new_props.expand);
    		if ('toggler' in $$new_props) $$invalidate(11, toggler = $$new_props.toggler);
    		if ('$$scope' in $$new_props) $$invalidate(14, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		collapseIn,
    		collapseOut,
    		classnames,
    		toggle,
    		dispatch,
    		isOpen,
    		className,
    		navbar,
    		onEntering,
    		onEntered,
    		onExiting,
    		onExited,
    		expand,
    		toggler,
    		windowWidth,
    		_wasMaximized,
    		minWidth,
    		notify,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('isOpen' in $$props) $$invalidate(0, isOpen = $$new_props.isOpen);
    		if ('className' in $$props) $$invalidate(9, className = $$new_props.className);
    		if ('navbar' in $$props) $$invalidate(1, navbar = $$new_props.navbar);
    		if ('onEntering' in $$props) $$invalidate(2, onEntering = $$new_props.onEntering);
    		if ('onEntered' in $$props) $$invalidate(3, onEntered = $$new_props.onEntered);
    		if ('onExiting' in $$props) $$invalidate(4, onExiting = $$new_props.onExiting);
    		if ('onExited' in $$props) $$invalidate(5, onExited = $$new_props.onExited);
    		if ('expand' in $$props) $$invalidate(10, expand = $$new_props.expand);
    		if ('toggler' in $$props) $$invalidate(11, toggler = $$new_props.toggler);
    		if ('windowWidth' in $$props) $$invalidate(6, windowWidth = $$new_props.windowWidth);
    		if ('_wasMaximized' in $$props) $$invalidate(12, _wasMaximized = $$new_props._wasMaximized);
    		if ('classes' in $$props) $$invalidate(7, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, navbar*/ 514) {
    			$$invalidate(7, classes = classnames(className, navbar && 'navbar-collapse'));
    		}

    		if ($$self.$$.dirty & /*navbar, expand, windowWidth, minWidth, isOpen, _wasMaximized*/ 13379) {
    			if (navbar && expand) {
    				if (windowWidth >= minWidth[expand] && !isOpen) {
    					$$invalidate(0, isOpen = true);
    					$$invalidate(12, _wasMaximized = true);
    					notify();
    				} else if (windowWidth < minWidth[expand] && _wasMaximized) {
    					$$invalidate(0, isOpen = false);
    					$$invalidate(12, _wasMaximized = false);
    					notify();
    				}
    			}
    		}
    	};

    	return [
    		isOpen,
    		navbar,
    		onEntering,
    		onEntered,
    		onExiting,
    		onExited,
    		windowWidth,
    		classes,
    		$$restProps,
    		className,
    		expand,
    		toggler,
    		_wasMaximized,
    		minWidth,
    		$$scope,
    		slots,
    		introstart_handler,
    		introend_handler,
    		outrostart_handler,
    		outroend_handler,
    		onwindowresize
    	];
    }

    class Collapse extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			isOpen: 0,
    			class: 9,
    			navbar: 1,
    			onEntering: 2,
    			onEntered: 3,
    			onExiting: 4,
    			onExited: 5,
    			expand: 10,
    			toggler: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Collapse",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get isOpen() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get navbar() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set navbar(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onEntering() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onEntering(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onEntered() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onEntered(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onExiting() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onExiting(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onExited() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onExited(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expand() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expand(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggler() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggler(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\AccordionItem.svelte generated by Svelte v3.44.1 */
    const file$g = "node_modules\\sveltestrap\\src\\AccordionItem.svelte";
    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({});

    // (31:2) <AccordionHeader     on:click={() => onToggle()}     class={!accordionOpen && 'collapsed'}   >
    function create_default_slot_1$7(ctx) {
    	let t0;
    	let t1;
    	let current;
    	const header_slot_template = /*#slots*/ ctx[9].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[16], get_header_slot_context);

    	const block = {
    		c: function create() {
    			if (header_slot) header_slot.c();
    			t0 = space();
    			t1 = text(/*header*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			if (header_slot) {
    				header_slot.m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (header_slot) {
    				if (header_slot.p && (!current || dirty & /*$$scope*/ 65536)) {
    					update_slot_base(
    						header_slot,
    						header_slot_template,
    						ctx,
    						/*$$scope*/ ctx[16],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[16])
    						: get_slot_changes(header_slot_template, /*$$scope*/ ctx[16], dirty, get_header_slot_changes),
    						get_header_slot_context
    					);
    				}
    			}

    			if (!current || dirty & /*header*/ 1) set_data_dev(t1, /*header*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (header_slot) header_slot.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$7.name,
    		type: "slot",
    		source: "(31:2) <AccordionHeader     on:click={() => onToggle()}     class={!accordionOpen && 'collapsed'}   >",
    		ctx
    	});

    	return block;
    }

    // (38:2) <Collapse     isOpen={accordionOpen}     class="accordion-collapse"     on:introstart     on:introend     on:outrostart     on:outroend   >
    function create_default_slot$7(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "accordion-body");
    			add_location(div, file$g, 45, 4, 1133);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 65536)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[16],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[16])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[16], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(38:2) <Collapse     isOpen={accordionOpen}     class=\\\"accordion-collapse\\\"     on:introstart     on:introend     on:outrostart     on:outroend   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div;
    	let accordionheader;
    	let t;
    	let collapse;
    	let current;

    	accordionheader = new AccordionHeader({
    			props: {
    				class: !/*accordionOpen*/ ctx[2] && 'collapsed',
    				$$slots: { default: [create_default_slot_1$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	accordionheader.$on("click", /*click_handler*/ ctx[10]);

    	collapse = new Collapse({
    			props: {
    				isOpen: /*accordionOpen*/ ctx[2],
    				class: "accordion-collapse",
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	collapse.$on("introstart", /*introstart_handler*/ ctx[11]);
    	collapse.$on("introend", /*introend_handler*/ ctx[12]);
    	collapse.$on("outrostart", /*outrostart_handler*/ ctx[13]);
    	collapse.$on("outroend", /*outroend_handler*/ ctx[14]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(accordionheader.$$.fragment);
    			t = space();
    			create_component(collapse.$$.fragment);
    			attr_dev(div, "class", /*classes*/ ctx[3]);
    			add_location(div, file$g, 29, 0, 783);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(accordionheader, div, null);
    			append_dev(div, t);
    			mount_component(collapse, div, null);
    			/*div_binding*/ ctx[15](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const accordionheader_changes = {};
    			if (dirty & /*accordionOpen*/ 4) accordionheader_changes.class = !/*accordionOpen*/ ctx[2] && 'collapsed';

    			if (dirty & /*$$scope, header*/ 65537) {
    				accordionheader_changes.$$scope = { dirty, ctx };
    			}

    			accordionheader.$set(accordionheader_changes);
    			const collapse_changes = {};
    			if (dirty & /*accordionOpen*/ 4) collapse_changes.isOpen = /*accordionOpen*/ ctx[2];

    			if (dirty & /*$$scope*/ 65536) {
    				collapse_changes.$$scope = { dirty, ctx };
    			}

    			collapse.$set(collapse_changes);

    			if (!current || dirty & /*classes*/ 8) {
    				attr_dev(div, "class", /*classes*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(accordionheader.$$.fragment, local);
    			transition_in(collapse.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(accordionheader.$$.fragment, local);
    			transition_out(collapse.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(accordionheader);
    			destroy_component(collapse);
    			/*div_binding*/ ctx[15](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let classes;
    	let accordionOpen;
    	let $open;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AccordionItem', slots, ['header','default']);
    	let { class: className = '' } = $$props;
    	let { header = '' } = $$props;
    	let { active = false } = $$props;
    	let accordionId;
    	const dispatch = createEventDispatcher();
    	const { stayOpen, toggle, open } = getContext('accordion');
    	validate_store(open, 'open');
    	component_subscribe($$self, open, value => $$invalidate(8, $open = value));

    	onMount(() => {
    		if (active) toggle(accordionId);
    	});

    	const onToggle = () => {
    		if (stayOpen) $$invalidate(6, active = !active);
    		toggle(accordionId);
    		dispatch('toggle', !accordionOpen);
    	};

    	const writable_props = ['class', 'header', 'active'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AccordionItem> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => onToggle();

    	function introstart_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function introend_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function outrostart_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function outroend_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			accordionId = $$value;
    			$$invalidate(1, accordionId);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(7, className = $$props.class);
    		if ('header' in $$props) $$invalidate(0, header = $$props.header);
    		if ('active' in $$props) $$invalidate(6, active = $$props.active);
    		if ('$$scope' in $$props) $$invalidate(16, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		getContext,
    		onMount,
    		classnames,
    		Collapse,
    		AccordionHeader,
    		className,
    		header,
    		active,
    		accordionId,
    		dispatch,
    		stayOpen,
    		toggle,
    		open,
    		onToggle,
    		accordionOpen,
    		classes,
    		$open
    	});

    	$$self.$inject_state = $$props => {
    		if ('className' in $$props) $$invalidate(7, className = $$props.className);
    		if ('header' in $$props) $$invalidate(0, header = $$props.header);
    		if ('active' in $$props) $$invalidate(6, active = $$props.active);
    		if ('accordionId' in $$props) $$invalidate(1, accordionId = $$props.accordionId);
    		if ('accordionOpen' in $$props) $$invalidate(2, accordionOpen = $$props.accordionOpen);
    		if ('classes' in $$props) $$invalidate(3, classes = $$props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className*/ 128) {
    			$$invalidate(3, classes = classnames(className, 'accordion-item'));
    		}

    		if ($$self.$$.dirty & /*active, $open, accordionId*/ 322) {
    			$$invalidate(2, accordionOpen = stayOpen ? active : $open === accordionId);
    		}
    	};

    	return [
    		header,
    		accordionId,
    		accordionOpen,
    		classes,
    		open,
    		onToggle,
    		active,
    		className,
    		$open,
    		slots,
    		click_handler,
    		introstart_handler,
    		introend_handler,
    		outrostart_handler,
    		outroend_handler,
    		div_binding,
    		$$scope
    	];
    }

    class AccordionItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { class: 7, header: 0, active: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AccordionItem",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get class() {
    		throw new Error("<AccordionItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<AccordionItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get header() {
    		throw new Error("<AccordionItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set header(value) {
    		throw new Error("<AccordionItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<AccordionItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<AccordionItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\Badge.svelte generated by Svelte v3.44.1 */
    const file$f = "node_modules\\sveltestrap\\src\\Badge.svelte";

    // (27:0) {:else}
    function create_else_block_1$1(ctx) {
    	let span;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_2$4, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*children*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let span_levels = [/*$$restProps*/ ctx[3], { class: /*classes*/ ctx[2] }];
    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if_block.c();
    			set_attributes(span, span_data);
    			add_location(span, file$f, 27, 2, 500);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if_blocks[current_block_type_index].m(span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(span, null);
    			}

    			set_attributes(span, span_data = get_spread_update(span_levels, [
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3],
    				(!current || dirty & /*classes*/ 4) && { class: /*classes*/ ctx[2] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(27:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (19:0) {#if href}
    function create_if_block$8(ctx) {
    	let a;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_1$5, create_else_block$6];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*children*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	let a_levels = [
    		/*$$restProps*/ ctx[3],
    		{ href: /*href*/ ctx[1] },
    		{ class: /*classes*/ ctx[2] }
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if_block.c();
    			set_attributes(a, a_data);
    			add_location(a, file$f, 19, 2, 366);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			if_blocks[current_block_type_index].m(a, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(a, null);
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3],
    				(!current || dirty & /*href*/ 2) && { href: /*href*/ ctx[1] },
    				(!current || dirty & /*classes*/ 4) && { class: /*classes*/ ctx[2] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(19:0) {#if href}",
    		ctx
    	});

    	return block;
    }

    // (31:4) {:else}
    function create_else_block_2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(31:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (29:4) {#if children}
    function create_if_block_2$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*children*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 1) set_data_dev(t, /*children*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(29:4) {#if children}",
    		ctx
    	});

    	return block;
    }

    // (23:4) {:else}
    function create_else_block$6(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(23:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (21:4) {#if children}
    function create_if_block_1$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*children*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 1) set_data_dev(t, /*children*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(21:4) {#if children}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$8, create_else_block_1$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let classes;
    	const omit_props_names = ["class","children","color","href","pill"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Badge', slots, ['default']);
    	let { class: className = '' } = $$props;
    	let { children = undefined } = $$props;
    	let { color = 'secondary' } = $$props;
    	let { href = undefined } = $$props;
    	let { pill = false } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(4, className = $$new_props.class);
    		if ('children' in $$new_props) $$invalidate(0, children = $$new_props.children);
    		if ('color' in $$new_props) $$invalidate(5, color = $$new_props.color);
    		if ('href' in $$new_props) $$invalidate(1, href = $$new_props.href);
    		if ('pill' in $$new_props) $$invalidate(6, pill = $$new_props.pill);
    		if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		classnames,
    		className,
    		children,
    		color,
    		href,
    		pill,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(4, className = $$new_props.className);
    		if ('children' in $$props) $$invalidate(0, children = $$new_props.children);
    		if ('color' in $$props) $$invalidate(5, color = $$new_props.color);
    		if ('href' in $$props) $$invalidate(1, href = $$new_props.href);
    		if ('pill' in $$props) $$invalidate(6, pill = $$new_props.pill);
    		if ('classes' in $$props) $$invalidate(2, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, color, pill*/ 112) {
    			$$invalidate(2, classes = classnames(className, 'badge', `bg-${color}`, pill ? 'rounded-pill' : false));
    		}
    	};

    	return [children, href, classes, $$restProps, className, color, pill, $$scope, slots];
    }

    class Badge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			class: 4,
    			children: 0,
    			color: 5,
    			href: 1,
    			pill: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Badge",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get class() {
    		throw new Error("<Badge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Badge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get children() {
    		throw new Error("<Badge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set children(value) {
    		throw new Error("<Badge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Badge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Badge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Badge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Badge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pill() {
    		throw new Error("<Badge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pill(value) {
    		throw new Error("<Badge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\FormCheck.svelte generated by Svelte v3.44.1 */
    const file$e = "node_modules\\sveltestrap\\src\\FormCheck.svelte";
    const get_label_slot_changes = dirty => ({});
    const get_label_slot_context = ctx => ({});

    // (66:2) {:else}
    function create_else_block$5(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[11],
    		{ class: /*inputClasses*/ ctx[9] },
    		{ id: /*idFor*/ ctx[8] },
    		{ type: "checkbox" },
    		{ disabled: /*disabled*/ ctx[3] },
    		{ name: /*name*/ ctx[5] },
    		{ __value: /*value*/ ctx[7] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$e, 66, 4, 1386);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			input.checked = /*checked*/ ctx[0];
    			/*input_binding_2*/ ctx[38](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_2*/ ctx[28], false, false, false),
    					listen_dev(input, "change", /*change_handler_2*/ ctx[29], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_2*/ ctx[30], false, false, false),
    					listen_dev(input, "input", /*input_handler_2*/ ctx[31], false, false, false),
    					listen_dev(input, "change", /*input_change_handler_2*/ ctx[37])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2048 && /*$$restProps*/ ctx[11],
    				dirty[0] & /*inputClasses*/ 512 && { class: /*inputClasses*/ ctx[9] },
    				dirty[0] & /*idFor*/ 256 && { id: /*idFor*/ ctx[8] },
    				{ type: "checkbox" },
    				dirty[0] & /*disabled*/ 8 && { disabled: /*disabled*/ ctx[3] },
    				dirty[0] & /*name*/ 32 && { name: /*name*/ ctx[5] },
    				dirty[0] & /*value*/ 128 && { __value: /*value*/ ctx[7] }
    			]));

    			if (dirty[0] & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding_2*/ ctx[38](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(66:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (50:30) 
    function create_if_block_2$3(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[11],
    		{ class: /*inputClasses*/ ctx[9] },
    		{ id: /*idFor*/ ctx[8] },
    		{ type: "checkbox" },
    		{ disabled: /*disabled*/ ctx[3] },
    		{ name: /*name*/ ctx[5] },
    		{ __value: /*value*/ ctx[7] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$e, 50, 4, 1122);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			input.checked = /*checked*/ ctx[0];
    			/*input_binding_1*/ ctx[36](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_1*/ ctx[24], false, false, false),
    					listen_dev(input, "change", /*change_handler_1*/ ctx[25], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_1*/ ctx[26], false, false, false),
    					listen_dev(input, "input", /*input_handler_1*/ ctx[27], false, false, false),
    					listen_dev(input, "change", /*input_change_handler_1*/ ctx[35])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2048 && /*$$restProps*/ ctx[11],
    				dirty[0] & /*inputClasses*/ 512 && { class: /*inputClasses*/ ctx[9] },
    				dirty[0] & /*idFor*/ 256 && { id: /*idFor*/ ctx[8] },
    				{ type: "checkbox" },
    				dirty[0] & /*disabled*/ 8 && { disabled: /*disabled*/ ctx[3] },
    				dirty[0] & /*name*/ 32 && { name: /*name*/ ctx[5] },
    				dirty[0] & /*value*/ 128 && { __value: /*value*/ ctx[7] }
    			]));

    			if (dirty[0] & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding_1*/ ctx[36](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(50:30) ",
    		ctx
    	});

    	return block;
    }

    // (34:2) {#if type === 'radio'}
    function create_if_block_1$4(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[11],
    		{ class: /*inputClasses*/ ctx[9] },
    		{ id: /*idFor*/ ctx[8] },
    		{ type: "radio" },
    		{ disabled: /*disabled*/ ctx[3] },
    		{ name: /*name*/ ctx[5] },
    		{ __value: /*value*/ ctx[7] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			/*$$binding_groups*/ ctx[33][0].push(input);
    			add_location(input, file$e, 34, 4, 842);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			input.checked = input.__value === /*group*/ ctx[1];
    			/*input_binding*/ ctx[34](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler*/ ctx[20], false, false, false),
    					listen_dev(input, "change", /*change_handler*/ ctx[21], false, false, false),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[22], false, false, false),
    					listen_dev(input, "input", /*input_handler*/ ctx[23], false, false, false),
    					listen_dev(input, "change", /*input_change_handler*/ ctx[32])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2048 && /*$$restProps*/ ctx[11],
    				dirty[0] & /*inputClasses*/ 512 && { class: /*inputClasses*/ ctx[9] },
    				dirty[0] & /*idFor*/ 256 && { id: /*idFor*/ ctx[8] },
    				{ type: "radio" },
    				dirty[0] & /*disabled*/ 8 && { disabled: /*disabled*/ ctx[3] },
    				dirty[0] & /*name*/ 32 && { name: /*name*/ ctx[5] },
    				dirty[0] & /*value*/ 128 && { __value: /*value*/ ctx[7] }
    			]));

    			if (dirty[0] & /*group*/ 2) {
    				input.checked = input.__value === /*group*/ ctx[1];
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*$$binding_groups*/ ctx[33][0].splice(/*$$binding_groups*/ ctx[33][0].indexOf(input), 1);
    			/*input_binding*/ ctx[34](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(34:2) {#if type === 'radio'}",
    		ctx
    	});

    	return block;
    }

    // (83:2) {#if label}
    function create_if_block$7(ctx) {
    	let label_1;
    	let current;
    	const label_slot_template = /*#slots*/ ctx[19].label;
    	const label_slot = create_slot(label_slot_template, ctx, /*$$scope*/ ctx[18], get_label_slot_context);
    	const label_slot_or_fallback = label_slot || fallback_block$1(ctx);

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			if (label_slot_or_fallback) label_slot_or_fallback.c();
    			attr_dev(label_1, "class", "form-check-label");
    			attr_dev(label_1, "for", /*idFor*/ ctx[8]);
    			add_location(label_1, file$e, 83, 4, 1662);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);

    			if (label_slot_or_fallback) {
    				label_slot_or_fallback.m(label_1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (label_slot) {
    				if (label_slot.p && (!current || dirty[0] & /*$$scope*/ 262144)) {
    					update_slot_base(
    						label_slot,
    						label_slot_template,
    						ctx,
    						/*$$scope*/ ctx[18],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
    						: get_slot_changes(label_slot_template, /*$$scope*/ ctx[18], dirty, get_label_slot_changes),
    						get_label_slot_context
    					);
    				}
    			} else {
    				if (label_slot_or_fallback && label_slot_or_fallback.p && (!current || dirty[0] & /*label*/ 16)) {
    					label_slot_or_fallback.p(ctx, !current ? [-1, -1] : dirty);
    				}
    			}

    			if (!current || dirty[0] & /*idFor*/ 256) {
    				attr_dev(label_1, "for", /*idFor*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			if (label_slot_or_fallback) label_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(83:2) {#if label}",
    		ctx
    	});

    	return block;
    }

    // (85:25) {label}
    function fallback_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*label*/ ctx[4]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*label*/ 16) set_data_dev(t, /*label*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(85:25) {label}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div;
    	let t;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[6] === 'radio') return create_if_block_1$4;
    		if (/*type*/ ctx[6] === 'switch') return create_if_block_2$3;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*label*/ ctx[4] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", /*classes*/ ctx[10]);
    			add_location(div, file$e, 32, 0, 791);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block0.m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			}

    			if (/*label*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*label*/ 16) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$7(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*classes*/ 1024) {
    				attr_dev(div, "class", /*classes*/ ctx[10]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let classes;
    	let inputClasses;
    	let idFor;

    	const omit_props_names = [
    		"class","checked","disabled","group","id","inline","inner","invalid","label","name","size","type","valid","value"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FormCheck', slots, ['label']);
    	let { class: className = '' } = $$props;
    	let { checked = false } = $$props;
    	let { disabled = false } = $$props;
    	let { group = undefined } = $$props;
    	let { id = undefined } = $$props;
    	let { inline = false } = $$props;
    	let { inner = undefined } = $$props;
    	let { invalid = false } = $$props;
    	let { label = '' } = $$props;
    	let { name = '' } = $$props;
    	let { size = '' } = $$props;
    	let { type = 'checkbox' } = $$props;
    	let { valid = false } = $$props;
    	let { value = undefined } = $$props;
    	const $$binding_groups = [[]];

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_change_handler() {
    		group = this.__value;
    		$$invalidate(1, group);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(2, inner);
    		});
    	}

    	function input_change_handler_1() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	function input_binding_1($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(2, inner);
    		});
    	}

    	function input_change_handler_2() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	function input_binding_2($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(2, inner);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(11, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(12, className = $$new_props.class);
    		if ('checked' in $$new_props) $$invalidate(0, checked = $$new_props.checked);
    		if ('disabled' in $$new_props) $$invalidate(3, disabled = $$new_props.disabled);
    		if ('group' in $$new_props) $$invalidate(1, group = $$new_props.group);
    		if ('id' in $$new_props) $$invalidate(13, id = $$new_props.id);
    		if ('inline' in $$new_props) $$invalidate(14, inline = $$new_props.inline);
    		if ('inner' in $$new_props) $$invalidate(2, inner = $$new_props.inner);
    		if ('invalid' in $$new_props) $$invalidate(15, invalid = $$new_props.invalid);
    		if ('label' in $$new_props) $$invalidate(4, label = $$new_props.label);
    		if ('name' in $$new_props) $$invalidate(5, name = $$new_props.name);
    		if ('size' in $$new_props) $$invalidate(16, size = $$new_props.size);
    		if ('type' in $$new_props) $$invalidate(6, type = $$new_props.type);
    		if ('valid' in $$new_props) $$invalidate(17, valid = $$new_props.valid);
    		if ('value' in $$new_props) $$invalidate(7, value = $$new_props.value);
    		if ('$$scope' in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		classnames,
    		className,
    		checked,
    		disabled,
    		group,
    		id,
    		inline,
    		inner,
    		invalid,
    		label,
    		name,
    		size,
    		type,
    		valid,
    		value,
    		idFor,
    		inputClasses,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(12, className = $$new_props.className);
    		if ('checked' in $$props) $$invalidate(0, checked = $$new_props.checked);
    		if ('disabled' in $$props) $$invalidate(3, disabled = $$new_props.disabled);
    		if ('group' in $$props) $$invalidate(1, group = $$new_props.group);
    		if ('id' in $$props) $$invalidate(13, id = $$new_props.id);
    		if ('inline' in $$props) $$invalidate(14, inline = $$new_props.inline);
    		if ('inner' in $$props) $$invalidate(2, inner = $$new_props.inner);
    		if ('invalid' in $$props) $$invalidate(15, invalid = $$new_props.invalid);
    		if ('label' in $$props) $$invalidate(4, label = $$new_props.label);
    		if ('name' in $$props) $$invalidate(5, name = $$new_props.name);
    		if ('size' in $$props) $$invalidate(16, size = $$new_props.size);
    		if ('type' in $$props) $$invalidate(6, type = $$new_props.type);
    		if ('valid' in $$props) $$invalidate(17, valid = $$new_props.valid);
    		if ('value' in $$props) $$invalidate(7, value = $$new_props.value);
    		if ('idFor' in $$props) $$invalidate(8, idFor = $$new_props.idFor);
    		if ('inputClasses' in $$props) $$invalidate(9, inputClasses = $$new_props.inputClasses);
    		if ('classes' in $$props) $$invalidate(10, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*className, type, inline, size*/ 86080) {
    			$$invalidate(10, classes = classnames(className, 'form-check', {
    				'form-switch': type === 'switch',
    				'form-check-inline': inline,
    				[`form-control-${size}`]: size
    			}));
    		}

    		if ($$self.$$.dirty[0] & /*invalid, valid*/ 163840) {
    			$$invalidate(9, inputClasses = classnames('form-check-input', { 'is-invalid': invalid, 'is-valid': valid }));
    		}

    		if ($$self.$$.dirty[0] & /*id, label*/ 8208) {
    			$$invalidate(8, idFor = id || label);
    		}
    	};

    	return [
    		checked,
    		group,
    		inner,
    		disabled,
    		label,
    		name,
    		type,
    		value,
    		idFor,
    		inputClasses,
    		classes,
    		$$restProps,
    		className,
    		id,
    		inline,
    		invalid,
    		size,
    		valid,
    		$$scope,
    		slots,
    		blur_handler,
    		change_handler,
    		focus_handler,
    		input_handler,
    		blur_handler_1,
    		change_handler_1,
    		focus_handler_1,
    		input_handler_1,
    		blur_handler_2,
    		change_handler_2,
    		focus_handler_2,
    		input_handler_2,
    		input_change_handler,
    		$$binding_groups,
    		input_binding,
    		input_change_handler_1,
    		input_binding_1,
    		input_change_handler_2,
    		input_binding_2
    	];
    }

    class FormCheck extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$f,
    			create_fragment$f,
    			safe_not_equal,
    			{
    				class: 12,
    				checked: 0,
    				disabled: 3,
    				group: 1,
    				id: 13,
    				inline: 14,
    				inner: 2,
    				invalid: 15,
    				label: 4,
    				name: 5,
    				size: 16,
    				type: 6,
    				valid: 17,
    				value: 7
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FormCheck",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get class() {
    		throw new Error("<FormCheck>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<FormCheck>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<FormCheck>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<FormCheck>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<FormCheck>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<FormCheck>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get group() {
    		throw new Error("<FormCheck>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<FormCheck>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<FormCheck>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<FormCheck>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inline() {
    		throw new Error("<FormCheck>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inline(value) {
    		throw new Error("<FormCheck>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inner() {
    		throw new Error("<FormCheck>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inner(value) {
    		throw new Error("<FormCheck>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get invalid() {
    		throw new Error("<FormCheck>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set invalid(value) {
    		throw new Error("<FormCheck>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<FormCheck>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<FormCheck>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<FormCheck>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<FormCheck>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<FormCheck>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<FormCheck>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<FormCheck>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<FormCheck>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valid() {
    		throw new Error("<FormCheck>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valid(value) {
    		throw new Error("<FormCheck>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<FormCheck>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<FormCheck>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\FormFeedback.svelte generated by Svelte v3.44.1 */
    const file$d = "node_modules\\sveltestrap\\src\\FormFeedback.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	let div_levels = [/*$$restProps*/ ctx[1], { class: /*classes*/ ctx[0] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$d, 19, 0, 368);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1],
    				(!current || dirty & /*classes*/ 1) && { class: /*classes*/ ctx[0] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	const omit_props_names = ["class","valid","tooltip"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FormFeedback', slots, ['default']);
    	let { class: className = '' } = $$props;
    	let { valid = undefined } = $$props;
    	let { tooltip = false } = $$props;
    	let classes;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('valid' in $$new_props) $$invalidate(3, valid = $$new_props.valid);
    		if ('tooltip' in $$new_props) $$invalidate(4, tooltip = $$new_props.tooltip);
    		if ('$$scope' in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		classnames,
    		className,
    		valid,
    		tooltip,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(2, className = $$new_props.className);
    		if ('valid' in $$props) $$invalidate(3, valid = $$new_props.valid);
    		if ('tooltip' in $$props) $$invalidate(4, tooltip = $$new_props.tooltip);
    		if ('classes' in $$props) $$invalidate(0, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*tooltip, className, valid*/ 28) {
    			{
    				const validMode = tooltip ? 'tooltip' : 'feedback';
    				$$invalidate(0, classes = classnames(className, valid ? `valid-${validMode}` : `invalid-${validMode}`));
    			}
    		}
    	};

    	return [classes, $$restProps, className, valid, tooltip, $$scope, slots];
    }

    class FormFeedback extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { class: 2, valid: 3, tooltip: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FormFeedback",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get class() {
    		throw new Error("<FormFeedback>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<FormFeedback>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valid() {
    		throw new Error("<FormFeedback>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valid(value) {
    		throw new Error("<FormFeedback>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tooltip() {
    		throw new Error("<FormFeedback>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltip(value) {
    		throw new Error("<FormFeedback>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\FormGroup.svelte generated by Svelte v3.44.1 */
    const file$c = "node_modules\\sveltestrap\\src\\FormGroup.svelte";

    // (24:0) {:else}
    function create_else_block$4(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);
    	let div_levels = [/*$$restProps*/ ctx[2], { class: /*classes*/ ctx[1] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$c, 24, 2, 528);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*$$restProps*/ 4 && /*$$restProps*/ ctx[2],
    				(!current || dirty & /*classes*/ 2) && { class: /*classes*/ ctx[1] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(24:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (20:0) {#if tag === 'fieldset'}
    function create_if_block$6(ctx) {
    	let fieldset;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);
    	let fieldset_levels = [/*$$restProps*/ ctx[2], { class: /*classes*/ ctx[1] }];
    	let fieldset_data = {};

    	for (let i = 0; i < fieldset_levels.length; i += 1) {
    		fieldset_data = assign(fieldset_data, fieldset_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			fieldset = element("fieldset");
    			if (default_slot) default_slot.c();
    			set_attributes(fieldset, fieldset_data);
    			add_location(fieldset, file$c, 20, 2, 447);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, fieldset, anchor);

    			if (default_slot) {
    				default_slot.m(fieldset, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(fieldset, fieldset_data = get_spread_update(fieldset_levels, [
    				dirty & /*$$restProps*/ 4 && /*$$restProps*/ ctx[2],
    				(!current || dirty & /*classes*/ 2) && { class: /*classes*/ ctx[1] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(fieldset);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(20:0) {#if tag === 'fieldset'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$6, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tag*/ ctx[0] === 'fieldset') return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let classes;
    	const omit_props_names = ["class","check","disabled","inline","row","tag"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FormGroup', slots, ['default']);
    	let { class: className = '' } = $$props;
    	let { check = false } = $$props;
    	let { disabled = false } = $$props;
    	let { inline = false } = $$props;
    	let { row = false } = $$props;
    	let { tag = null } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(2, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(3, className = $$new_props.class);
    		if ('check' in $$new_props) $$invalidate(4, check = $$new_props.check);
    		if ('disabled' in $$new_props) $$invalidate(5, disabled = $$new_props.disabled);
    		if ('inline' in $$new_props) $$invalidate(6, inline = $$new_props.inline);
    		if ('row' in $$new_props) $$invalidate(7, row = $$new_props.row);
    		if ('tag' in $$new_props) $$invalidate(0, tag = $$new_props.tag);
    		if ('$$scope' in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		classnames,
    		className,
    		check,
    		disabled,
    		inline,
    		row,
    		tag,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(3, className = $$new_props.className);
    		if ('check' in $$props) $$invalidate(4, check = $$new_props.check);
    		if ('disabled' in $$props) $$invalidate(5, disabled = $$new_props.disabled);
    		if ('inline' in $$props) $$invalidate(6, inline = $$new_props.inline);
    		if ('row' in $$props) $$invalidate(7, row = $$new_props.row);
    		if ('tag' in $$props) $$invalidate(0, tag = $$new_props.tag);
    		if ('classes' in $$props) $$invalidate(1, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, row, check, inline, disabled*/ 248) {
    			$$invalidate(1, classes = classnames(className, 'mb-3', {
    				row,
    				'form-check': check,
    				'form-check-inline': check && inline,
    				disabled: check && disabled
    			}));
    		}
    	};

    	return [
    		tag,
    		classes,
    		$$restProps,
    		className,
    		check,
    		disabled,
    		inline,
    		row,
    		$$scope,
    		slots
    	];
    }

    class FormGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			class: 3,
    			check: 4,
    			disabled: 5,
    			inline: 6,
    			row: 7,
    			tag: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FormGroup",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get class() {
    		throw new Error("<FormGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<FormGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get check() {
    		throw new Error("<FormGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set check(value) {
    		throw new Error("<FormGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<FormGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<FormGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inline() {
    		throw new Error("<FormGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inline(value) {
    		throw new Error("<FormGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get row() {
    		throw new Error("<FormGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set row(value) {
    		throw new Error("<FormGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tag() {
    		throw new Error("<FormGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tag(value) {
    		throw new Error("<FormGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\InlineContainer.svelte generated by Svelte v3.44.1 */

    const file$b = "node_modules\\sveltestrap\\src\\InlineContainer.svelte";

    function create_fragment$c(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div, file$b, 3, 0, 67);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('InlineContainer', slots, ['default']);
    	let x = 'wtf svelte?'; // eslint-disable-line
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<InlineContainer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ x });

    	$$self.$inject_state = $$props => {
    		if ('x' in $$props) x = $$props.x;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$$scope, slots];
    }

    class InlineContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InlineContainer",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* node_modules\sveltestrap\src\Input.svelte generated by Svelte v3.44.1 */
    const file$a = "node_modules\\sveltestrap\\src\\Input.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[210] = list[i];
    	return child_ctx;
    }

    // (490:40) 
    function create_if_block_22(ctx) {
    	let select;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[24].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[209], null);

    	let select_levels = [
    		/*$$restProps*/ ctx[21],
    		{ class: /*classes*/ ctx[18] },
    		{ name: /*name*/ ctx[13] },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ readonly: /*readonly*/ ctx[15] }
    	];

    	let select_data = {};

    	for (let i = 0; i < select_levels.length; i += 1) {
    		select_data = assign(select_data, select_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			if (default_slot) default_slot.c();
    			set_attributes(select, select_data);
    			if (/*value*/ ctx[6] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[207].call(select));
    			add_location(select, file$a, 490, 2, 9190);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			if (default_slot) {
    				default_slot.m(select, null);
    			}

    			(select_data.multiple ? select_options : select_option)(select, select_data.value);
    			if (select.autofocus) select.focus();
    			select_option(select, /*value*/ ctx[6]);
    			/*select_binding*/ ctx[208](select);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "blur", /*blur_handler_20*/ ctx[156], false, false, false),
    					listen_dev(select, "change", /*change_handler_19*/ ctx[157], false, false, false),
    					listen_dev(select, "focus", /*focus_handler_20*/ ctx[158], false, false, false),
    					listen_dev(select, "input", /*input_handler_19*/ ctx[159], false, false, false),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[207])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[6] & /*$$scope*/ 8388608)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[209],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[209])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[209], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(select, select_data = get_spread_update(select_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				(!current || dirty[0] & /*classes*/ 262144) && { class: /*classes*/ ctx[18] },
    				(!current || dirty[0] & /*name*/ 8192) && { name: /*name*/ ctx[13] },
    				(!current || dirty[0] & /*disabled*/ 256) && { disabled: /*disabled*/ ctx[8] },
    				(!current || dirty[0] & /*readonly*/ 32768) && { readonly: /*readonly*/ ctx[15] }
    			]));

    			if (dirty[0] & /*$$restProps, classes, name, disabled, readonly*/ 2400512 && 'value' in select_data) (select_data.multiple ? select_options : select_option)(select, select_data.value);

    			if (dirty[0] & /*value*/ 64) {
    				select_option(select, /*value*/ ctx[6]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			if (default_slot) default_slot.d(detaching);
    			/*select_binding*/ ctx[208](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_22.name,
    		type: "if",
    		source: "(490:40) ",
    		ctx
    	});

    	return block;
    }

    // (472:29) 
    function create_if_block_21(ctx) {
    	let textarea;
    	let mounted;
    	let dispose;

    	let textarea_levels = [
    		/*$$restProps*/ ctx[21],
    		{ class: /*classes*/ ctx[18] },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ name: /*name*/ ctx[13] },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ readOnly: /*readonly*/ ctx[15] }
    	];

    	let textarea_data = {};

    	for (let i = 0; i < textarea_levels.length; i += 1) {
    		textarea_data = assign(textarea_data, textarea_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			set_attributes(textarea, textarea_data);
    			add_location(textarea, file$a, 472, 2, 8899);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			if (textarea.autofocus) textarea.focus();
    			set_input_value(textarea, /*value*/ ctx[6]);
    			/*textarea_binding*/ ctx[206](textarea);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "blur", /*blur_handler_19*/ ctx[149], false, false, false),
    					listen_dev(textarea, "change", /*change_handler_18*/ ctx[150], false, false, false),
    					listen_dev(textarea, "focus", /*focus_handler_19*/ ctx[151], false, false, false),
    					listen_dev(textarea, "input", /*input_handler_18*/ ctx[152], false, false, false),
    					listen_dev(textarea, "keydown", /*keydown_handler_19*/ ctx[153], false, false, false),
    					listen_dev(textarea, "keypress", /*keypress_handler_19*/ ctx[154], false, false, false),
    					listen_dev(textarea, "keyup", /*keyup_handler_19*/ ctx[155], false, false, false),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[205])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(textarea, textarea_data = get_spread_update(textarea_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] }
    			]));

    			if (dirty[0] & /*value*/ 64) {
    				set_input_value(textarea, /*value*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			/*textarea_binding*/ ctx[206](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_21.name,
    		type: "if",
    		source: "(472:29) ",
    		ctx
    	});

    	return block;
    }

    // (93:0) {#if tag === 'input'}
    function create_if_block_2$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	const if_block_creators = [
    		create_if_block_3$2,
    		create_if_block_4$2,
    		create_if_block_5$1,
    		create_if_block_6$1,
    		create_if_block_7$1,
    		create_if_block_8,
    		create_if_block_9,
    		create_if_block_10,
    		create_if_block_11,
    		create_if_block_12,
    		create_if_block_13,
    		create_if_block_14,
    		create_if_block_15,
    		create_if_block_16,
    		create_if_block_17,
    		create_if_block_18,
    		create_if_block_19,
    		create_if_block_20,
    		create_else_block_1
    	];

    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*type*/ ctx[16] === 'text') return 0;
    		if (/*type*/ ctx[16] === 'password') return 1;
    		if (/*type*/ ctx[16] === 'color') return 2;
    		if (/*type*/ ctx[16] === 'email') return 3;
    		if (/*type*/ ctx[16] === 'file') return 4;
    		if (/*type*/ ctx[16] === 'checkbox' || /*type*/ ctx[16] === 'radio' || /*type*/ ctx[16] === 'switch') return 5;
    		if (/*type*/ ctx[16] === 'url') return 6;
    		if (/*type*/ ctx[16] === 'number') return 7;
    		if (/*type*/ ctx[16] === 'date') return 8;
    		if (/*type*/ ctx[16] === 'time') return 9;
    		if (/*type*/ ctx[16] === 'datetime') return 10;
    		if (/*type*/ ctx[16] === 'datetime-local') return 11;
    		if (/*type*/ ctx[16] === 'month') return 12;
    		if (/*type*/ ctx[16] === 'color') return 13;
    		if (/*type*/ ctx[16] === 'range') return 14;
    		if (/*type*/ ctx[16] === 'search') return 15;
    		if (/*type*/ ctx[16] === 'tel') return 16;
    		if (/*type*/ ctx[16] === 'week') return 17;
    		return 18;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(93:0) {#if tag === 'input'}",
    		ctx
    	});

    	return block;
    }

    // (453:2) {:else}
    function create_else_block_1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[21],
    		{ type: /*type*/ ctx[16] },
    		{ readOnly: /*readonly*/ ctx[15] },
    		{ class: /*classes*/ ctx[18] },
    		{ name: /*name*/ ctx[13] },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ value: /*value*/ ctx[6] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 453, 4, 8568);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			input.value = input_data.value;
    			if (input.autofocus) input.focus();

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_18*/ ctx[144], false, false, false),
    					listen_dev(input, "change", /*handleInput*/ ctx[20], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_18*/ ctx[145], false, false, false),
    					listen_dev(input, "input", /*handleInput*/ ctx[20], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_18*/ ctx[146], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_18*/ ctx[147], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_18*/ ctx[148], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				dirty[0] & /*type*/ 65536 && { type: /*type*/ ctx[16] },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] },
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] },
    				dirty[0] & /*value*/ 64 && input.value !== /*value*/ ctx[6] && { value: /*value*/ ctx[6] }
    			]));

    			if ('value' in input_data) {
    				input.value = input_data.value;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(453:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (434:28) 
    function create_if_block_20(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[21],
    		{ class: /*classes*/ ctx[18] },
    		{ type: "week" },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ name: /*name*/ ctx[13] },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ readOnly: /*readonly*/ ctx[15] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 434, 4, 8259);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			set_input_value(input, /*value*/ ctx[6]);
    			/*input_binding_16*/ ctx[204](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_17*/ ctx[137], false, false, false),
    					listen_dev(input, "change", /*change_handler_17*/ ctx[138], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_17*/ ctx[139], false, false, false),
    					listen_dev(input, "input", /*input_handler_17*/ ctx[140], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_17*/ ctx[141], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_17*/ ctx[142], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_17*/ ctx[143], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_14*/ ctx[203])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				{ type: "week" },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] }
    			]));

    			if (dirty[0] & /*value*/ 64) {
    				set_input_value(input, /*value*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding_16*/ ctx[204](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20.name,
    		type: "if",
    		source: "(434:28) ",
    		ctx
    	});

    	return block;
    }

    // (414:27) 
    function create_if_block_19(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[21],
    		{ class: /*classes*/ ctx[18] },
    		{ type: "tel" },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ name: /*name*/ ctx[13] },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ readOnly: /*readonly*/ ctx[15] },
    		{ size: /*size*/ ctx[1] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 414, 4, 7919);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			set_input_value(input, /*value*/ ctx[6]);
    			/*input_binding_15*/ ctx[202](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_16*/ ctx[130], false, false, false),
    					listen_dev(input, "change", /*change_handler_16*/ ctx[131], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_16*/ ctx[132], false, false, false),
    					listen_dev(input, "input", /*input_handler_16*/ ctx[133], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_16*/ ctx[134], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_16*/ ctx[135], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_16*/ ctx[136], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_13*/ ctx[201])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				{ type: "tel" },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] },
    				dirty[0] & /*size*/ 2 && { size: /*size*/ ctx[1] }
    			]));

    			if (dirty[0] & /*value*/ 64) {
    				set_input_value(input, /*value*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding_15*/ ctx[202](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(414:27) ",
    		ctx
    	});

    	return block;
    }

    // (394:30) 
    function create_if_block_18(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[21],
    		{ class: /*classes*/ ctx[18] },
    		{ type: "search" },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ name: /*name*/ ctx[13] },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ readOnly: /*readonly*/ ctx[15] },
    		{ size: /*size*/ ctx[1] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 394, 4, 7577);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			set_input_value(input, /*value*/ ctx[6]);
    			/*input_binding_14*/ ctx[200](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_15*/ ctx[123], false, false, false),
    					listen_dev(input, "change", /*change_handler_15*/ ctx[124], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_15*/ ctx[125], false, false, false),
    					listen_dev(input, "input", /*input_handler_15*/ ctx[126], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_15*/ ctx[127], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_15*/ ctx[128], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_15*/ ctx[129], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_12*/ ctx[199])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				{ type: "search" },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] },
    				dirty[0] & /*size*/ 2 && { size: /*size*/ ctx[1] }
    			]));

    			if (dirty[0] & /*value*/ 64) {
    				set_input_value(input, /*value*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding_14*/ ctx[200](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(394:30) ",
    		ctx
    	});

    	return block;
    }

    // (375:29) 
    function create_if_block_17(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[21],
    		{ type: "range" },
    		{ readOnly: /*readonly*/ ctx[15] },
    		{ class: /*classes*/ ctx[18] },
    		{ name: /*name*/ ctx[13] },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ placeholder: /*placeholder*/ ctx[14] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 375, 4, 7246);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			set_input_value(input, /*value*/ ctx[6]);
    			/*input_binding_13*/ ctx[198](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_14*/ ctx[116], false, false, false),
    					listen_dev(input, "change", /*change_handler_14*/ ctx[117], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_14*/ ctx[118], false, false, false),
    					listen_dev(input, "input", /*input_handler_14*/ ctx[119], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_14*/ ctx[120], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_14*/ ctx[121], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_14*/ ctx[122], false, false, false),
    					listen_dev(input, "change", /*input_change_input_handler*/ ctx[197]),
    					listen_dev(input, "input", /*input_change_input_handler*/ ctx[197])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				{ type: "range" },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] },
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] }
    			]));

    			if (dirty[0] & /*value*/ 64) {
    				set_input_value(input, /*value*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding_13*/ ctx[198](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(375:29) ",
    		ctx
    	});

    	return block;
    }

    // (356:29) 
    function create_if_block_16(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[21],
    		{ type: "color" },
    		{ readOnly: /*readonly*/ ctx[15] },
    		{ class: /*classes*/ ctx[18] },
    		{ name: /*name*/ ctx[13] },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ placeholder: /*placeholder*/ ctx[14] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 356, 4, 6916);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			set_input_value(input, /*value*/ ctx[6]);
    			/*input_binding_12*/ ctx[196](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_13*/ ctx[109], false, false, false),
    					listen_dev(input, "change", /*change_handler_13*/ ctx[110], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_13*/ ctx[111], false, false, false),
    					listen_dev(input, "input", /*input_handler_13*/ ctx[112], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_13*/ ctx[113], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_13*/ ctx[114], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_13*/ ctx[115], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_11*/ ctx[195])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				{ type: "color" },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] },
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] }
    			]));

    			if (dirty[0] & /*value*/ 64) {
    				set_input_value(input, /*value*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding_12*/ ctx[196](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(356:29) ",
    		ctx
    	});

    	return block;
    }

    // (337:29) 
    function create_if_block_15(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[21],
    		{ class: /*classes*/ ctx[18] },
    		{ type: "month" },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ name: /*name*/ ctx[13] },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ readOnly: /*readonly*/ ctx[15] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 337, 4, 6586);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			set_input_value(input, /*value*/ ctx[6]);
    			/*input_binding_11*/ ctx[194](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_12*/ ctx[102], false, false, false),
    					listen_dev(input, "change", /*change_handler_12*/ ctx[103], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_12*/ ctx[104], false, false, false),
    					listen_dev(input, "input", /*input_handler_12*/ ctx[105], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_12*/ ctx[106], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_12*/ ctx[107], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_12*/ ctx[108], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_10*/ ctx[193])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				{ type: "month" },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] }
    			]));

    			if (dirty[0] & /*value*/ 64) {
    				set_input_value(input, /*value*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding_11*/ ctx[194](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(337:29) ",
    		ctx
    	});

    	return block;
    }

    // (318:38) 
    function create_if_block_14(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[21],
    		{ class: /*classes*/ ctx[18] },
    		{ type: "datetime-local" },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ name: /*name*/ ctx[13] },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ readOnly: /*readonly*/ ctx[15] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 318, 4, 6247);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			set_input_value(input, /*value*/ ctx[6]);
    			/*input_binding_10*/ ctx[192](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_11*/ ctx[95], false, false, false),
    					listen_dev(input, "change", /*change_handler_11*/ ctx[96], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_11*/ ctx[97], false, false, false),
    					listen_dev(input, "input", /*input_handler_11*/ ctx[98], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_11*/ ctx[99], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_11*/ ctx[100], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_11*/ ctx[101], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_9*/ ctx[191])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				{ type: "datetime-local" },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] }
    			]));

    			if (dirty[0] & /*value*/ 64) {
    				set_input_value(input, /*value*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding_10*/ ctx[192](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(318:38) ",
    		ctx
    	});

    	return block;
    }

    // (299:32) 
    function create_if_block_13(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[21],
    		{ type: "datetime" },
    		{ readOnly: /*readonly*/ ctx[15] },
    		{ class: /*classes*/ ctx[18] },
    		{ name: /*name*/ ctx[13] },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ placeholder: /*placeholder*/ ctx[14] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 299, 4, 5905);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			set_input_value(input, /*value*/ ctx[6]);
    			/*input_binding_9*/ ctx[190](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_10*/ ctx[88], false, false, false),
    					listen_dev(input, "change", /*change_handler_10*/ ctx[89], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_10*/ ctx[90], false, false, false),
    					listen_dev(input, "input", /*input_handler_10*/ ctx[91], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_10*/ ctx[92], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_10*/ ctx[93], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_10*/ ctx[94], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_8*/ ctx[189])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				{ type: "datetime" },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] },
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] }
    			]));

    			if (dirty[0] & /*value*/ 64) {
    				set_input_value(input, /*value*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding_9*/ ctx[190](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(299:32) ",
    		ctx
    	});

    	return block;
    }

    // (280:28) 
    function create_if_block_12(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[21],
    		{ class: /*classes*/ ctx[18] },
    		{ type: "time" },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ name: /*name*/ ctx[13] },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ readOnly: /*readonly*/ ctx[15] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 280, 4, 5573);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			set_input_value(input, /*value*/ ctx[6]);
    			/*input_binding_8*/ ctx[188](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_9*/ ctx[81], false, false, false),
    					listen_dev(input, "change", /*change_handler_9*/ ctx[82], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_9*/ ctx[83], false, false, false),
    					listen_dev(input, "input", /*input_handler_9*/ ctx[84], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_9*/ ctx[85], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_9*/ ctx[86], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_9*/ ctx[87], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_7*/ ctx[187])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				{ type: "time" },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] }
    			]));

    			if (dirty[0] & /*value*/ 64) {
    				set_input_value(input, /*value*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding_8*/ ctx[188](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(280:28) ",
    		ctx
    	});

    	return block;
    }

    // (261:28) 
    function create_if_block_11(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[21],
    		{ class: /*classes*/ ctx[18] },
    		{ type: "date" },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ name: /*name*/ ctx[13] },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ readOnly: /*readonly*/ ctx[15] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 261, 4, 5245);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			set_input_value(input, /*value*/ ctx[6]);
    			/*input_binding_7*/ ctx[186](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_8*/ ctx[74], false, false, false),
    					listen_dev(input, "change", /*change_handler_8*/ ctx[75], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_8*/ ctx[76], false, false, false),
    					listen_dev(input, "input", /*input_handler_8*/ ctx[77], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_8*/ ctx[78], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_8*/ ctx[79], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_8*/ ctx[80], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_6*/ ctx[185])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				{ type: "date" },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] }
    			]));

    			if (dirty[0] & /*value*/ 64) {
    				set_input_value(input, /*value*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding_7*/ ctx[186](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(261:28) ",
    		ctx
    	});

    	return block;
    }

    // (242:30) 
    function create_if_block_10(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[21],
    		{ class: /*classes*/ ctx[18] },
    		{ type: "number" },
    		{ readOnly: /*readonly*/ ctx[15] },
    		{ name: /*name*/ ctx[13] },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ placeholder: /*placeholder*/ ctx[14] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 242, 4, 4915);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			set_input_value(input, /*value*/ ctx[6]);
    			/*input_binding_6*/ ctx[184](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_7*/ ctx[67], false, false, false),
    					listen_dev(input, "change", /*change_handler_7*/ ctx[68], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_7*/ ctx[69], false, false, false),
    					listen_dev(input, "input", /*input_handler_7*/ ctx[70], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_7*/ ctx[71], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_7*/ ctx[72], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_7*/ ctx[73], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_5*/ ctx[183])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				{ type: "number" },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] }
    			]));

    			if (dirty[0] & /*value*/ 64 && to_number(input.value) !== /*value*/ ctx[6]) {
    				set_input_value(input, /*value*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding_6*/ ctx[184](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(242:30) ",
    		ctx
    	});

    	return block;
    }

    // (222:27) 
    function create_if_block_9(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[21],
    		{ class: /*classes*/ ctx[18] },
    		{ type: "url" },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ name: /*name*/ ctx[13] },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ readOnly: /*readonly*/ ctx[15] },
    		{ size: /*size*/ ctx[1] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 222, 4, 4573);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			set_input_value(input, /*value*/ ctx[6]);
    			/*input_binding_5*/ ctx[182](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_6*/ ctx[60], false, false, false),
    					listen_dev(input, "change", /*change_handler_6*/ ctx[61], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_6*/ ctx[62], false, false, false),
    					listen_dev(input, "input", /*input_handler_6*/ ctx[63], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_6*/ ctx[64], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_6*/ ctx[65], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_6*/ ctx[66], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_4*/ ctx[181])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				{ type: "url" },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] },
    				dirty[0] & /*size*/ 2 && { size: /*size*/ ctx[1] }
    			]));

    			if (dirty[0] & /*value*/ 64) {
    				set_input_value(input, /*value*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding_5*/ ctx[182](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(222:27) ",
    		ctx
    	});

    	return block;
    }

    // (197:73) 
    function create_if_block_8(ctx) {
    	let formcheck;
    	let updating_checked;
    	let updating_inner;
    	let updating_group;
    	let updating_value;
    	let current;

    	const formcheck_spread_levels = [
    		/*$$restProps*/ ctx[21],
    		{ class: /*className*/ ctx[7] },
    		{ size: /*bsSize*/ ctx[0] },
    		{ type: /*type*/ ctx[16] },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ invalid: /*invalid*/ ctx[10] },
    		{ label: /*label*/ ctx[11] },
    		{ name: /*name*/ ctx[13] },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ readonly: /*readonly*/ ctx[15] },
    		{ valid: /*valid*/ ctx[17] }
    	];

    	function formcheck_checked_binding(value) {
    		/*formcheck_checked_binding*/ ctx[170](value);
    	}

    	function formcheck_inner_binding(value) {
    		/*formcheck_inner_binding*/ ctx[171](value);
    	}

    	function formcheck_group_binding(value) {
    		/*formcheck_group_binding*/ ctx[172](value);
    	}

    	function formcheck_value_binding(value) {
    		/*formcheck_value_binding*/ ctx[173](value);
    	}

    	let formcheck_props = {};

    	for (let i = 0; i < formcheck_spread_levels.length; i += 1) {
    		formcheck_props = assign(formcheck_props, formcheck_spread_levels[i]);
    	}

    	if (/*checked*/ ctx[2] !== void 0) {
    		formcheck_props.checked = /*checked*/ ctx[2];
    	}

    	if (/*inner*/ ctx[5] !== void 0) {
    		formcheck_props.inner = /*inner*/ ctx[5];
    	}

    	if (/*group*/ ctx[4] !== void 0) {
    		formcheck_props.group = /*group*/ ctx[4];
    	}

    	if (/*value*/ ctx[6] !== void 0) {
    		formcheck_props.value = /*value*/ ctx[6];
    	}

    	formcheck = new FormCheck({ props: formcheck_props, $$inline: true });
    	binding_callbacks.push(() => bind(formcheck, 'checked', formcheck_checked_binding));
    	binding_callbacks.push(() => bind(formcheck, 'inner', formcheck_inner_binding));
    	binding_callbacks.push(() => bind(formcheck, 'group', formcheck_group_binding));
    	binding_callbacks.push(() => bind(formcheck, 'value', formcheck_value_binding));
    	formcheck.$on("blur", /*blur_handler_5*/ ctx[174]);
    	formcheck.$on("change", /*change_handler_5*/ ctx[175]);
    	formcheck.$on("focus", /*focus_handler_5*/ ctx[176]);
    	formcheck.$on("input", /*input_handler_5*/ ctx[177]);
    	formcheck.$on("keydown", /*keydown_handler_5*/ ctx[178]);
    	formcheck.$on("keypress", /*keypress_handler_5*/ ctx[179]);
    	formcheck.$on("keyup", /*keyup_handler_5*/ ctx[180]);

    	const block = {
    		c: function create() {
    			create_component(formcheck.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(formcheck, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const formcheck_changes = (dirty[0] & /*$$restProps, className, bsSize, type, disabled, invalid, label, name, placeholder, readonly, valid*/ 2354561)
    			? get_spread_update(formcheck_spread_levels, [
    					dirty[0] & /*$$restProps*/ 2097152 && get_spread_object(/*$$restProps*/ ctx[21]),
    					dirty[0] & /*className*/ 128 && { class: /*className*/ ctx[7] },
    					dirty[0] & /*bsSize*/ 1 && { size: /*bsSize*/ ctx[0] },
    					dirty[0] & /*type*/ 65536 && { type: /*type*/ ctx[16] },
    					dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    					dirty[0] & /*invalid*/ 1024 && { invalid: /*invalid*/ ctx[10] },
    					dirty[0] & /*label*/ 2048 && { label: /*label*/ ctx[11] },
    					dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    					dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] },
    					dirty[0] & /*readonly*/ 32768 && { readonly: /*readonly*/ ctx[15] },
    					dirty[0] & /*valid*/ 131072 && { valid: /*valid*/ ctx[17] }
    				])
    			: {};

    			if (!updating_checked && dirty[0] & /*checked*/ 4) {
    				updating_checked = true;
    				formcheck_changes.checked = /*checked*/ ctx[2];
    				add_flush_callback(() => updating_checked = false);
    			}

    			if (!updating_inner && dirty[0] & /*inner*/ 32) {
    				updating_inner = true;
    				formcheck_changes.inner = /*inner*/ ctx[5];
    				add_flush_callback(() => updating_inner = false);
    			}

    			if (!updating_group && dirty[0] & /*group*/ 16) {
    				updating_group = true;
    				formcheck_changes.group = /*group*/ ctx[4];
    				add_flush_callback(() => updating_group = false);
    			}

    			if (!updating_value && dirty[0] & /*value*/ 64) {
    				updating_value = true;
    				formcheck_changes.value = /*value*/ ctx[6];
    				add_flush_callback(() => updating_value = false);
    			}

    			formcheck.$set(formcheck_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(formcheck.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(formcheck.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(formcheck, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(197:73) ",
    		ctx
    	});

    	return block;
    }

    // (174:28) 
    function create_if_block_7$1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[21],
    		{ class: /*classes*/ ctx[18] },
    		{ type: "file" },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ invalid: /*invalid*/ ctx[10] },
    		{ multiple: /*multiple*/ ctx[12] },
    		{ name: /*name*/ ctx[13] },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ readOnly: /*readonly*/ ctx[15] },
    		{ valid: /*valid*/ ctx[17] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 174, 4, 3715);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			/*input_binding_4*/ ctx[169](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_4*/ ctx[53], false, false, false),
    					listen_dev(input, "change", /*change_handler_4*/ ctx[54], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_4*/ ctx[55], false, false, false),
    					listen_dev(input, "input", /*input_handler_4*/ ctx[56], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_4*/ ctx[57], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_4*/ ctx[58], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_4*/ ctx[59], false, false, false),
    					listen_dev(input, "change", /*input_change_handler*/ ctx[168])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				{ type: "file" },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*invalid*/ 1024 && { invalid: /*invalid*/ ctx[10] },
    				dirty[0] & /*multiple*/ 4096 && { multiple: /*multiple*/ ctx[12] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] },
    				dirty[0] & /*valid*/ 131072 && { valid: /*valid*/ ctx[17] }
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding_4*/ ctx[169](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(174:28) ",
    		ctx
    	});

    	return block;
    }

    // (153:29) 
    function create_if_block_6$1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[21],
    		{ class: /*classes*/ ctx[18] },
    		{ type: "email" },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ multiple: /*multiple*/ ctx[12] },
    		{ name: /*name*/ ctx[13] },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ readOnly: /*readonly*/ ctx[15] },
    		{ size: /*size*/ ctx[1] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 153, 4, 3356);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			set_input_value(input, /*value*/ ctx[6]);
    			/*input_binding_3*/ ctx[167](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_3*/ ctx[46], false, false, false),
    					listen_dev(input, "change", /*change_handler_3*/ ctx[47], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_3*/ ctx[48], false, false, false),
    					listen_dev(input, "input", /*input_handler_3*/ ctx[49], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_3*/ ctx[50], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_3*/ ctx[51], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_3*/ ctx[52], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_3*/ ctx[166])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				{ type: "email" },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*multiple*/ 4096 && { multiple: /*multiple*/ ctx[12] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] },
    				dirty[0] & /*size*/ 2 && { size: /*size*/ ctx[1] }
    			]));

    			if (dirty[0] & /*value*/ 64 && input.value !== /*value*/ ctx[6]) {
    				set_input_value(input, /*value*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding_3*/ ctx[167](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(153:29) ",
    		ctx
    	});

    	return block;
    }

    // (134:29) 
    function create_if_block_5$1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[21],
    		{ class: /*classes*/ ctx[18] },
    		{ type: "color" },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ name: /*name*/ ctx[13] },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ readOnly: /*readonly*/ ctx[15] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 134, 4, 3026);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			set_input_value(input, /*value*/ ctx[6]);
    			/*input_binding_2*/ ctx[165](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_2*/ ctx[39], false, false, false),
    					listen_dev(input, "change", /*change_handler_2*/ ctx[40], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_2*/ ctx[41], false, false, false),
    					listen_dev(input, "input", /*input_handler_2*/ ctx[42], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_2*/ ctx[43], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_2*/ ctx[44], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_2*/ ctx[45], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_2*/ ctx[164])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				{ type: "color" },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] }
    			]));

    			if (dirty[0] & /*value*/ 64) {
    				set_input_value(input, /*value*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding_2*/ ctx[165](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(134:29) ",
    		ctx
    	});

    	return block;
    }

    // (114:32) 
    function create_if_block_4$2(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[21],
    		{ class: /*classes*/ ctx[18] },
    		{ type: "password" },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ name: /*name*/ ctx[13] },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ readOnly: /*readonly*/ ctx[15] },
    		{ size: /*size*/ ctx[1] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 114, 4, 2680);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			set_input_value(input, /*value*/ ctx[6]);
    			/*input_binding_1*/ ctx[163](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler_1*/ ctx[32], false, false, false),
    					listen_dev(input, "change", /*change_handler_1*/ ctx[33], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_1*/ ctx[34], false, false, false),
    					listen_dev(input, "input", /*input_handler_1*/ ctx[35], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_1*/ ctx[36], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_1*/ ctx[37], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_1*/ ctx[38], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_1*/ ctx[162])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				{ type: "password" },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] },
    				dirty[0] & /*size*/ 2 && { size: /*size*/ ctx[1] }
    			]));

    			if (dirty[0] & /*value*/ 64 && input.value !== /*value*/ ctx[6]) {
    				set_input_value(input, /*value*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding_1*/ ctx[163](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(114:32) ",
    		ctx
    	});

    	return block;
    }

    // (94:2) {#if type === 'text'}
    function create_if_block_3$2(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[21],
    		{ class: /*classes*/ ctx[18] },
    		{ type: "text" },
    		{ disabled: /*disabled*/ ctx[8] },
    		{ name: /*name*/ ctx[13] },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ readOnly: /*readonly*/ ctx[15] },
    		{ size: /*size*/ ctx[1] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 94, 4, 2335);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			set_input_value(input, /*value*/ ctx[6]);
    			/*input_binding*/ ctx[161](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler*/ ctx[25], false, false, false),
    					listen_dev(input, "change", /*change_handler*/ ctx[26], false, false, false),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[27], false, false, false),
    					listen_dev(input, "input", /*input_handler*/ ctx[28], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler*/ ctx[29], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler*/ ctx[30], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler*/ ctx[31], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[160])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 2097152 && /*$$restProps*/ ctx[21],
    				dirty[0] & /*classes*/ 262144 && { class: /*classes*/ ctx[18] },
    				{ type: "text" },
    				dirty[0] & /*disabled*/ 256 && { disabled: /*disabled*/ ctx[8] },
    				dirty[0] & /*name*/ 8192 && { name: /*name*/ ctx[13] },
    				dirty[0] & /*placeholder*/ 16384 && { placeholder: /*placeholder*/ ctx[14] },
    				dirty[0] & /*readonly*/ 32768 && { readOnly: /*readonly*/ ctx[15] },
    				dirty[0] & /*size*/ 2 && { size: /*size*/ ctx[1] }
    			]));

    			if (dirty[0] & /*value*/ 64 && input.value !== /*value*/ ctx[6]) {
    				set_input_value(input, /*value*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding*/ ctx[161](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(94:2) {#if type === 'text'}",
    		ctx
    	});

    	return block;
    }

    // (523:0) {#if feedback}
    function create_if_block$5(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (show_if == null || dirty[0] & /*feedback*/ 512) show_if = !!Array.isArray(/*feedback*/ ctx[9]);
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx, [-1, -1, -1, -1, -1, -1, -1]);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(523:0) {#if feedback}",
    		ctx
    	});

    	return block;
    }

    // (528:2) {:else}
    function create_else_block$3(ctx) {
    	let formfeedback;
    	let current;

    	formfeedback = new FormFeedback({
    			props: {
    				valid: /*valid*/ ctx[17],
    				$$slots: { default: [create_default_slot_1$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(formfeedback.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(formfeedback, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const formfeedback_changes = {};
    			if (dirty[0] & /*valid*/ 131072) formfeedback_changes.valid = /*valid*/ ctx[17];

    			if (dirty[0] & /*feedback*/ 512 | dirty[6] & /*$$scope*/ 8388608) {
    				formfeedback_changes.$$scope = { dirty, ctx };
    			}

    			formfeedback.$set(formfeedback_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(formfeedback.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(formfeedback.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(formfeedback, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(528:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (524:2) {#if Array.isArray(feedback)}
    function create_if_block_1$3(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*feedback*/ ctx[9];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*valid, feedback*/ 131584) {
    				each_value = /*feedback*/ ctx[9];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(524:2) {#if Array.isArray(feedback)}",
    		ctx
    	});

    	return block;
    }

    // (529:4) <FormFeedback {valid}>
    function create_default_slot_1$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*feedback*/ ctx[9]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*feedback*/ 512) set_data_dev(t, /*feedback*/ ctx[9]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$6.name,
    		type: "slot",
    		source: "(529:4) <FormFeedback {valid}>",
    		ctx
    	});

    	return block;
    }

    // (526:6) <FormFeedback {valid}>
    function create_default_slot$6(ctx) {
    	let t_value = /*msg*/ ctx[210] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*feedback*/ 512 && t_value !== (t_value = /*msg*/ ctx[210] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(526:6) <FormFeedback {valid}>",
    		ctx
    	});

    	return block;
    }

    // (525:4) {#each feedback as msg}
    function create_each_block$1(ctx) {
    	let formfeedback;
    	let current;

    	formfeedback = new FormFeedback({
    			props: {
    				valid: /*valid*/ ctx[17],
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(formfeedback.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(formfeedback, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const formfeedback_changes = {};
    			if (dirty[0] & /*valid*/ 131072) formfeedback_changes.valid = /*valid*/ ctx[17];

    			if (dirty[0] & /*feedback*/ 512 | dirty[6] & /*$$scope*/ 8388608) {
    				formfeedback_changes.$$scope = { dirty, ctx };
    			}

    			formfeedback.$set(formfeedback_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(formfeedback.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(formfeedback.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(formfeedback, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(525:4) {#each feedback as msg}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let if_block1_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2$2, create_if_block_21, create_if_block_22];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tag*/ ctx[19] === 'input') return 0;
    		if (/*tag*/ ctx[19] === 'textarea') return 1;
    		if (/*tag*/ ctx[19] === 'select' && !/*multiple*/ ctx[12]) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let if_block1 = /*feedback*/ ctx[9] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block0) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block0 = if_blocks[current_block_type_index];

    					if (!if_block0) {
    						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block0.c();
    					} else {
    						if_block0.p(ctx, dirty);
    					}

    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				} else {
    					if_block0 = null;
    				}
    			}

    			if (/*feedback*/ ctx[9]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*feedback*/ 512) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$5(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"class","bsSize","checked","color","disabled","feedback","files","group","inner","invalid","label","multiple","name","placeholder","plaintext","readonly","size","type","valid","value"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Input', slots, ['default']);
    	let { class: className = '' } = $$props;
    	let { bsSize = undefined } = $$props;
    	let { checked = false } = $$props;
    	let { color = undefined } = $$props;
    	let { disabled = undefined } = $$props;
    	let { feedback = undefined } = $$props;
    	let { files = undefined } = $$props;
    	let { group = undefined } = $$props;
    	let { inner = undefined } = $$props;
    	let { invalid = false } = $$props;
    	let { label = undefined } = $$props;
    	let { multiple = undefined } = $$props;
    	let { name = '' } = $$props;
    	let { placeholder = '' } = $$props;
    	let { plaintext = false } = $$props;
    	let { readonly = undefined } = $$props;
    	let { size = undefined } = $$props;
    	let { type = 'text' } = $$props;
    	let { valid = false } = $$props;
    	let { value = '' } = $$props;
    	let classes;
    	let tag;

    	const handleInput = event => {
    		$$invalidate(6, value = event.target.value);
    	};

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_3(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_3(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_3(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_3(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_3(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_3(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_3(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_4(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_4(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_4(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_4(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_4(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_4(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_4(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_6(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_6(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_6(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_6(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_6(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_6(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_6(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_7(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_7(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_7(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_7(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_7(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_7(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_7(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_8(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_8(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_8(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_8(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_8(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_8(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_8(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_9(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_9(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_9(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_9(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_9(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_9(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_9(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_10(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_10(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_10(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_10(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_10(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_10(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_10(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_11(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_11(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_11(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_11(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_11(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_11(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_11(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_12(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_12(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_12(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_12(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_12(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_12(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_12(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_13(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_13(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_13(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_13(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_13(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_13(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_13(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_14(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_14(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_14(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_14(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_14(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_14(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_14(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_15(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_15(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_15(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_15(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_15(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_15(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_15(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_16(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_16(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_16(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_16(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_16(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_16(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_16(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_17(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_17(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_17(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_17(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_17(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_17(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_17(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_18(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_18(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_18(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_18(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_18(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_19(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_18(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_19(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_18(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_19(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_19(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_19(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_20(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_19(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_20(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_19(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(6, value);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	function input_input_handler_1() {
    		value = this.value;
    		$$invalidate(6, value);
    	}

    	function input_binding_1($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	function input_input_handler_2() {
    		value = this.value;
    		$$invalidate(6, value);
    	}

    	function input_binding_2($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	function input_input_handler_3() {
    		value = this.value;
    		$$invalidate(6, value);
    	}

    	function input_binding_3($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	function input_change_handler() {
    		files = this.files;
    		value = this.value;
    		$$invalidate(3, files);
    		$$invalidate(6, value);
    	}

    	function input_binding_4($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	function formcheck_checked_binding(value) {
    		checked = value;
    		$$invalidate(2, checked);
    	}

    	function formcheck_inner_binding(value) {
    		inner = value;
    		$$invalidate(5, inner);
    	}

    	function formcheck_group_binding(value) {
    		group = value;
    		$$invalidate(4, group);
    	}

    	function formcheck_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(6, value);
    	}

    	function blur_handler_5(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_5(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_5(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_5(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_5(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_5(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_5(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_input_handler_4() {
    		value = this.value;
    		$$invalidate(6, value);
    	}

    	function input_binding_5($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	function input_input_handler_5() {
    		value = to_number(this.value);
    		$$invalidate(6, value);
    	}

    	function input_binding_6($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	function input_input_handler_6() {
    		value = this.value;
    		$$invalidate(6, value);
    	}

    	function input_binding_7($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	function input_input_handler_7() {
    		value = this.value;
    		$$invalidate(6, value);
    	}

    	function input_binding_8($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	function input_input_handler_8() {
    		value = this.value;
    		$$invalidate(6, value);
    	}

    	function input_binding_9($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	function input_input_handler_9() {
    		value = this.value;
    		$$invalidate(6, value);
    	}

    	function input_binding_10($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	function input_input_handler_10() {
    		value = this.value;
    		$$invalidate(6, value);
    	}

    	function input_binding_11($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	function input_input_handler_11() {
    		value = this.value;
    		$$invalidate(6, value);
    	}

    	function input_binding_12($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	function input_change_input_handler() {
    		value = to_number(this.value);
    		$$invalidate(6, value);
    	}

    	function input_binding_13($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	function input_input_handler_12() {
    		value = this.value;
    		$$invalidate(6, value);
    	}

    	function input_binding_14($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	function input_input_handler_13() {
    		value = this.value;
    		$$invalidate(6, value);
    	}

    	function input_binding_15($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	function input_input_handler_14() {
    		value = this.value;
    		$$invalidate(6, value);
    	}

    	function input_binding_16($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	function textarea_input_handler() {
    		value = this.value;
    		$$invalidate(6, value);
    	}

    	function textarea_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	function select_change_handler() {
    		value = select_value(this);
    		$$invalidate(6, value);
    	}

    	function select_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inner = $$value;
    			$$invalidate(5, inner);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(21, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(7, className = $$new_props.class);
    		if ('bsSize' in $$new_props) $$invalidate(0, bsSize = $$new_props.bsSize);
    		if ('checked' in $$new_props) $$invalidate(2, checked = $$new_props.checked);
    		if ('color' in $$new_props) $$invalidate(22, color = $$new_props.color);
    		if ('disabled' in $$new_props) $$invalidate(8, disabled = $$new_props.disabled);
    		if ('feedback' in $$new_props) $$invalidate(9, feedback = $$new_props.feedback);
    		if ('files' in $$new_props) $$invalidate(3, files = $$new_props.files);
    		if ('group' in $$new_props) $$invalidate(4, group = $$new_props.group);
    		if ('inner' in $$new_props) $$invalidate(5, inner = $$new_props.inner);
    		if ('invalid' in $$new_props) $$invalidate(10, invalid = $$new_props.invalid);
    		if ('label' in $$new_props) $$invalidate(11, label = $$new_props.label);
    		if ('multiple' in $$new_props) $$invalidate(12, multiple = $$new_props.multiple);
    		if ('name' in $$new_props) $$invalidate(13, name = $$new_props.name);
    		if ('placeholder' in $$new_props) $$invalidate(14, placeholder = $$new_props.placeholder);
    		if ('plaintext' in $$new_props) $$invalidate(23, plaintext = $$new_props.plaintext);
    		if ('readonly' in $$new_props) $$invalidate(15, readonly = $$new_props.readonly);
    		if ('size' in $$new_props) $$invalidate(1, size = $$new_props.size);
    		if ('type' in $$new_props) $$invalidate(16, type = $$new_props.type);
    		if ('valid' in $$new_props) $$invalidate(17, valid = $$new_props.valid);
    		if ('value' in $$new_props) $$invalidate(6, value = $$new_props.value);
    		if ('$$scope' in $$new_props) $$invalidate(209, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		FormCheck,
    		FormFeedback,
    		classnames,
    		className,
    		bsSize,
    		checked,
    		color,
    		disabled,
    		feedback,
    		files,
    		group,
    		inner,
    		invalid,
    		label,
    		multiple,
    		name,
    		placeholder,
    		plaintext,
    		readonly,
    		size,
    		type,
    		valid,
    		value,
    		classes,
    		tag,
    		handleInput
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(7, className = $$new_props.className);
    		if ('bsSize' in $$props) $$invalidate(0, bsSize = $$new_props.bsSize);
    		if ('checked' in $$props) $$invalidate(2, checked = $$new_props.checked);
    		if ('color' in $$props) $$invalidate(22, color = $$new_props.color);
    		if ('disabled' in $$props) $$invalidate(8, disabled = $$new_props.disabled);
    		if ('feedback' in $$props) $$invalidate(9, feedback = $$new_props.feedback);
    		if ('files' in $$props) $$invalidate(3, files = $$new_props.files);
    		if ('group' in $$props) $$invalidate(4, group = $$new_props.group);
    		if ('inner' in $$props) $$invalidate(5, inner = $$new_props.inner);
    		if ('invalid' in $$props) $$invalidate(10, invalid = $$new_props.invalid);
    		if ('label' in $$props) $$invalidate(11, label = $$new_props.label);
    		if ('multiple' in $$props) $$invalidate(12, multiple = $$new_props.multiple);
    		if ('name' in $$props) $$invalidate(13, name = $$new_props.name);
    		if ('placeholder' in $$props) $$invalidate(14, placeholder = $$new_props.placeholder);
    		if ('plaintext' in $$props) $$invalidate(23, plaintext = $$new_props.plaintext);
    		if ('readonly' in $$props) $$invalidate(15, readonly = $$new_props.readonly);
    		if ('size' in $$props) $$invalidate(1, size = $$new_props.size);
    		if ('type' in $$props) $$invalidate(16, type = $$new_props.type);
    		if ('valid' in $$props) $$invalidate(17, valid = $$new_props.valid);
    		if ('value' in $$props) $$invalidate(6, value = $$new_props.value);
    		if ('classes' in $$props) $$invalidate(18, classes = $$new_props.classes);
    		if ('tag' in $$props) $$invalidate(19, tag = $$new_props.tag);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*type, color, plaintext, size, className, invalid, valid, bsSize*/ 12780675) {
    			{
    				const isNotaNumber = new RegExp('\\D', 'g');
    				let isBtn = false;
    				let formControlClass = 'form-control';
    				$$invalidate(19, tag = 'input');

    				switch (type) {
    					case 'color':
    						formControlClass = `form-control form-control-color`;
    						break;
    					case 'range':
    						formControlClass = 'form-range';
    						break;
    					case 'select':
    						formControlClass = `form-select`;
    						$$invalidate(19, tag = 'select');
    						break;
    					case 'textarea':
    						$$invalidate(19, tag = 'textarea');
    						break;
    					case 'button':
    					case 'reset':
    					case 'submit':
    						formControlClass = `btn btn-${color || 'secondary'}`;
    						isBtn = true;
    						break;
    					case 'hidden':
    					case 'image':
    						formControlClass = undefined;
    						break;
    					default:
    						formControlClass = 'form-control';
    						$$invalidate(19, tag = 'input');
    				}

    				if (plaintext) {
    					formControlClass = `${formControlClass}-plaintext`;
    					$$invalidate(19, tag = 'input');
    				}

    				if (size && isNotaNumber.test(size)) {
    					console.warn('Please use the prop "bsSize" instead of the "size" to bootstrap\'s input sizing.');
    					$$invalidate(0, bsSize = size);
    					$$invalidate(1, size = undefined);
    				}

    				$$invalidate(18, classes = classnames(className, formControlClass, {
    					'is-invalid': invalid,
    					'is-valid': valid,
    					[`form-control-${bsSize}`]: bsSize && !isBtn,
    					[`btn-${bsSize}`]: bsSize && isBtn
    				}));
    			}
    		}
    	};

    	return [
    		bsSize,
    		size,
    		checked,
    		files,
    		group,
    		inner,
    		value,
    		className,
    		disabled,
    		feedback,
    		invalid,
    		label,
    		multiple,
    		name,
    		placeholder,
    		readonly,
    		type,
    		valid,
    		classes,
    		tag,
    		handleInput,
    		$$restProps,
    		color,
    		plaintext,
    		slots,
    		blur_handler,
    		change_handler,
    		focus_handler,
    		input_handler,
    		keydown_handler,
    		keypress_handler,
    		keyup_handler,
    		blur_handler_1,
    		change_handler_1,
    		focus_handler_1,
    		input_handler_1,
    		keydown_handler_1,
    		keypress_handler_1,
    		keyup_handler_1,
    		blur_handler_2,
    		change_handler_2,
    		focus_handler_2,
    		input_handler_2,
    		keydown_handler_2,
    		keypress_handler_2,
    		keyup_handler_2,
    		blur_handler_3,
    		change_handler_3,
    		focus_handler_3,
    		input_handler_3,
    		keydown_handler_3,
    		keypress_handler_3,
    		keyup_handler_3,
    		blur_handler_4,
    		change_handler_4,
    		focus_handler_4,
    		input_handler_4,
    		keydown_handler_4,
    		keypress_handler_4,
    		keyup_handler_4,
    		blur_handler_6,
    		change_handler_6,
    		focus_handler_6,
    		input_handler_6,
    		keydown_handler_6,
    		keypress_handler_6,
    		keyup_handler_6,
    		blur_handler_7,
    		change_handler_7,
    		focus_handler_7,
    		input_handler_7,
    		keydown_handler_7,
    		keypress_handler_7,
    		keyup_handler_7,
    		blur_handler_8,
    		change_handler_8,
    		focus_handler_8,
    		input_handler_8,
    		keydown_handler_8,
    		keypress_handler_8,
    		keyup_handler_8,
    		blur_handler_9,
    		change_handler_9,
    		focus_handler_9,
    		input_handler_9,
    		keydown_handler_9,
    		keypress_handler_9,
    		keyup_handler_9,
    		blur_handler_10,
    		change_handler_10,
    		focus_handler_10,
    		input_handler_10,
    		keydown_handler_10,
    		keypress_handler_10,
    		keyup_handler_10,
    		blur_handler_11,
    		change_handler_11,
    		focus_handler_11,
    		input_handler_11,
    		keydown_handler_11,
    		keypress_handler_11,
    		keyup_handler_11,
    		blur_handler_12,
    		change_handler_12,
    		focus_handler_12,
    		input_handler_12,
    		keydown_handler_12,
    		keypress_handler_12,
    		keyup_handler_12,
    		blur_handler_13,
    		change_handler_13,
    		focus_handler_13,
    		input_handler_13,
    		keydown_handler_13,
    		keypress_handler_13,
    		keyup_handler_13,
    		blur_handler_14,
    		change_handler_14,
    		focus_handler_14,
    		input_handler_14,
    		keydown_handler_14,
    		keypress_handler_14,
    		keyup_handler_14,
    		blur_handler_15,
    		change_handler_15,
    		focus_handler_15,
    		input_handler_15,
    		keydown_handler_15,
    		keypress_handler_15,
    		keyup_handler_15,
    		blur_handler_16,
    		change_handler_16,
    		focus_handler_16,
    		input_handler_16,
    		keydown_handler_16,
    		keypress_handler_16,
    		keyup_handler_16,
    		blur_handler_17,
    		change_handler_17,
    		focus_handler_17,
    		input_handler_17,
    		keydown_handler_17,
    		keypress_handler_17,
    		keyup_handler_17,
    		blur_handler_18,
    		focus_handler_18,
    		keydown_handler_18,
    		keypress_handler_18,
    		keyup_handler_18,
    		blur_handler_19,
    		change_handler_18,
    		focus_handler_19,
    		input_handler_18,
    		keydown_handler_19,
    		keypress_handler_19,
    		keyup_handler_19,
    		blur_handler_20,
    		change_handler_19,
    		focus_handler_20,
    		input_handler_19,
    		input_input_handler,
    		input_binding,
    		input_input_handler_1,
    		input_binding_1,
    		input_input_handler_2,
    		input_binding_2,
    		input_input_handler_3,
    		input_binding_3,
    		input_change_handler,
    		input_binding_4,
    		formcheck_checked_binding,
    		formcheck_inner_binding,
    		formcheck_group_binding,
    		formcheck_value_binding,
    		blur_handler_5,
    		change_handler_5,
    		focus_handler_5,
    		input_handler_5,
    		keydown_handler_5,
    		keypress_handler_5,
    		keyup_handler_5,
    		input_input_handler_4,
    		input_binding_5,
    		input_input_handler_5,
    		input_binding_6,
    		input_input_handler_6,
    		input_binding_7,
    		input_input_handler_7,
    		input_binding_8,
    		input_input_handler_8,
    		input_binding_9,
    		input_input_handler_9,
    		input_binding_10,
    		input_input_handler_10,
    		input_binding_11,
    		input_input_handler_11,
    		input_binding_12,
    		input_change_input_handler,
    		input_binding_13,
    		input_input_handler_12,
    		input_binding_14,
    		input_input_handler_13,
    		input_binding_15,
    		input_input_handler_14,
    		input_binding_16,
    		textarea_input_handler,
    		textarea_binding,
    		select_change_handler,
    		select_binding,
    		$$scope
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$b,
    			create_fragment$b,
    			safe_not_equal,
    			{
    				class: 7,
    				bsSize: 0,
    				checked: 2,
    				color: 22,
    				disabled: 8,
    				feedback: 9,
    				files: 3,
    				group: 4,
    				inner: 5,
    				invalid: 10,
    				label: 11,
    				multiple: 12,
    				name: 13,
    				placeholder: 14,
    				plaintext: 23,
    				readonly: 15,
    				size: 1,
    				type: 16,
    				valid: 17,
    				value: 6
    			},
    			null,
    			[-1, -1, -1, -1, -1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get class() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bsSize() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bsSize(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get feedback() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set feedback(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get files() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set files(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get group() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inner() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inner(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get invalid() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set invalid(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get plaintext() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set plaintext(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valid() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valid(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\ModalBackdrop.svelte generated by Svelte v3.44.1 */
    const file$9 = "node_modules\\sveltestrap\\src\\ModalBackdrop.svelte";

    // (12:0) {#if isOpen}
    function create_if_block$4(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;
    	let div_levels = [/*$$restProps*/ ctx[3], { class: /*classes*/ ctx[2] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_attributes(div, div_data);
    			toggle_class(div, "fade", /*fade*/ ctx[1]);
    			add_location(div, file$9, 12, 2, 350);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3],
    				(!current || dirty & /*classes*/ 4) && { class: /*classes*/ ctx[2] }
    			]));

    			toggle_class(div, "fade", /*fade*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, backdropIn, {});
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, backdropOut, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(12:0) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*isOpen*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let classes;
    	const omit_props_names = ["class","isOpen","fade"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ModalBackdrop', slots, []);
    	let { class: className = '' } = $$props;
    	let { isOpen = false } = $$props;
    	let { fade = true } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(4, className = $$new_props.class);
    		if ('isOpen' in $$new_props) $$invalidate(0, isOpen = $$new_props.isOpen);
    		if ('fade' in $$new_props) $$invalidate(1, fade = $$new_props.fade);
    	};

    	$$self.$capture_state = () => ({
    		classnames,
    		backdropIn,
    		backdropOut,
    		className,
    		isOpen,
    		fade,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(4, className = $$new_props.className);
    		if ('isOpen' in $$props) $$invalidate(0, isOpen = $$new_props.isOpen);
    		if ('fade' in $$props) $$invalidate(1, fade = $$new_props.fade);
    		if ('classes' in $$props) $$invalidate(2, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className*/ 16) {
    			$$invalidate(2, classes = classnames(className, 'modal-backdrop'));
    		}
    	};

    	return [isOpen, fade, classes, $$restProps, className, click_handler];
    }

    class ModalBackdrop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { class: 4, isOpen: 0, fade: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModalBackdrop",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get class() {
    		throw new Error("<ModalBackdrop>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ModalBackdrop>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<ModalBackdrop>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<ModalBackdrop>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fade() {
    		throw new Error("<ModalBackdrop>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fade(value) {
    		throw new Error("<ModalBackdrop>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\ModalBody.svelte generated by Svelte v3.44.1 */
    const file$8 = "node_modules\\sveltestrap\\src\\ModalBody.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let div_levels = [/*$$restProps*/ ctx[1], { class: /*classes*/ ctx[0] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$8, 9, 0, 165);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1],
    				(!current || dirty & /*classes*/ 1) && { class: /*classes*/ ctx[0] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let classes;
    	const omit_props_names = ["class"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ModalBody', slots, ['default']);
    	let { class: className = '' } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('$$scope' in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ classnames, className, classes });

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(2, className = $$new_props.className);
    		if ('classes' in $$props) $$invalidate(0, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className*/ 4) {
    			$$invalidate(0, classes = classnames(className, 'modal-body'));
    		}
    	};

    	return [classes, $$restProps, className, $$scope, slots];
    }

    class ModalBody extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { class: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModalBody",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get class() {
    		throw new Error("<ModalBody>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ModalBody>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\ModalHeader.svelte generated by Svelte v3.44.1 */
    const file$7 = "node_modules\\sveltestrap\\src\\ModalHeader.svelte";
    const get_close_slot_changes = dirty => ({});
    const get_close_slot_context = ctx => ({});

    // (17:4) {:else}
    function create_else_block$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(17:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:4) {#if children}
    function create_if_block_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*children*/ ctx[2]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 4) set_data_dev(t, /*children*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(15:4) {#if children}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#if typeof toggle === 'function'}
    function create_if_block$3(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn-close");
    			attr_dev(button, "aria-label", /*closeAriaLabel*/ ctx[1]);
    			add_location(button, file$7, 22, 6, 488);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*toggle*/ ctx[0])) /*toggle*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*closeAriaLabel*/ 2) {
    				attr_dev(button, "aria-label", /*closeAriaLabel*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(22:4) {#if typeof toggle === 'function'}",
    		ctx
    	});

    	return block;
    }

    // (21:21)      
    function fallback_block(ctx) {
    	let if_block_anchor;
    	let if_block = typeof /*toggle*/ ctx[0] === 'function' && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (typeof /*toggle*/ ctx[0] === 'function') {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(21:21)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div;
    	let h5;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let current;
    	const if_block_creators = [create_if_block_1$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*children*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const close_slot_template = /*#slots*/ ctx[7].close;
    	const close_slot = create_slot(close_slot_template, ctx, /*$$scope*/ ctx[6], get_close_slot_context);
    	const close_slot_or_fallback = close_slot || fallback_block(ctx);
    	let div_levels = [/*$$restProps*/ ctx[4], { class: /*classes*/ ctx[3] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h5 = element("h5");
    			if_block.c();
    			t = space();
    			if (close_slot_or_fallback) close_slot_or_fallback.c();
    			attr_dev(h5, "class", "modal-title");
    			add_location(h5, file$7, 13, 2, 315);
    			set_attributes(div, div_data);
    			add_location(div, file$7, 12, 0, 274);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h5);
    			if_blocks[current_block_type_index].m(h5, null);
    			append_dev(div, t);

    			if (close_slot_or_fallback) {
    				close_slot_or_fallback.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(h5, null);
    			}

    			if (close_slot) {
    				if (close_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						close_slot,
    						close_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(close_slot_template, /*$$scope*/ ctx[6], dirty, get_close_slot_changes),
    						get_close_slot_context
    					);
    				}
    			} else {
    				if (close_slot_or_fallback && close_slot_or_fallback.p && (!current || dirty & /*closeAriaLabel, toggle*/ 3)) {
    					close_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*$$restProps*/ 16 && /*$$restProps*/ ctx[4],
    				(!current || dirty & /*classes*/ 8) && { class: /*classes*/ ctx[3] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(close_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(close_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			if (close_slot_or_fallback) close_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let classes;
    	const omit_props_names = ["class","toggle","closeAriaLabel","children"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ModalHeader', slots, ['default','close']);
    	let { class: className = '' } = $$props;
    	let { toggle = undefined } = $$props;
    	let { closeAriaLabel = 'Close' } = $$props;
    	let { children = undefined } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(4, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(5, className = $$new_props.class);
    		if ('toggle' in $$new_props) $$invalidate(0, toggle = $$new_props.toggle);
    		if ('closeAriaLabel' in $$new_props) $$invalidate(1, closeAriaLabel = $$new_props.closeAriaLabel);
    		if ('children' in $$new_props) $$invalidate(2, children = $$new_props.children);
    		if ('$$scope' in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		classnames,
    		className,
    		toggle,
    		closeAriaLabel,
    		children,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(5, className = $$new_props.className);
    		if ('toggle' in $$props) $$invalidate(0, toggle = $$new_props.toggle);
    		if ('closeAriaLabel' in $$props) $$invalidate(1, closeAriaLabel = $$new_props.closeAriaLabel);
    		if ('children' in $$props) $$invalidate(2, children = $$new_props.children);
    		if ('classes' in $$props) $$invalidate(3, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className*/ 32) {
    			$$invalidate(3, classes = classnames(className, 'modal-header'));
    		}
    	};

    	return [
    		toggle,
    		closeAriaLabel,
    		children,
    		classes,
    		$$restProps,
    		className,
    		$$scope,
    		slots
    	];
    }

    class ModalHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			class: 5,
    			toggle: 0,
    			closeAriaLabel: 1,
    			children: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModalHeader",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get class() {
    		throw new Error("<ModalHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ModalHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggle() {
    		throw new Error("<ModalHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggle(value) {
    		throw new Error("<ModalHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeAriaLabel() {
    		throw new Error("<ModalHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeAriaLabel(value) {
    		throw new Error("<ModalHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get children() {
    		throw new Error("<ModalHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set children(value) {
    		throw new Error("<ModalHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\Portal.svelte generated by Svelte v3.44.1 */
    const file$6 = "node_modules\\sveltestrap\\src\\Portal.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);
    	let div_levels = [/*$$restProps*/ ctx[1]];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$6, 18, 0, 346);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[4](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1]]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[4](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Portal', slots, ['default']);
    	let ref;
    	let portal;

    	onMount(() => {
    		portal = document.createElement('div');
    		document.body.appendChild(portal);
    		portal.appendChild(ref);
    	});

    	onDestroy(() => {
    		if (typeof document !== 'undefined') {
    			document.body.removeChild(portal);
    		}
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(0, ref);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('$$scope' in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ onMount, onDestroy, ref, portal });

    	$$self.$inject_state = $$new_props => {
    		if ('ref' in $$props) $$invalidate(0, ref = $$new_props.ref);
    		if ('portal' in $$props) portal = $$new_props.portal;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ref, $$restProps, $$scope, slots, div_binding];
    }

    class Portal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Portal",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* node_modules\sveltestrap\src\Modal.svelte generated by Svelte v3.44.1 */

    const file$5 = "node_modules\\sveltestrap\\src\\Modal.svelte";
    const get_external_slot_changes = dirty => ({});
    const get_external_slot_context = ctx => ({});

    // (216:0) {#if _isMounted}
    function create_if_block_1$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*outer*/ ctx[13];

    	function switch_props(ctx) {
    		return {
    			props: {
    				$$slots: { default: [create_default_slot_1$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};

    			if (dirty[0] & /*wrapClassName, $$restProps, labelledBy, modalClassName, fade, staticModal, classes, _dialog, contentClassName, body, toggle, header, isOpen*/ 1071039 | dirty[1] & /*$$scope*/ 8) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*outer*/ ctx[13])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(216:0) {#if _isMounted}",
    		ctx
    	});

    	return block;
    }

    // (219:6) {#if isOpen}
    function create_if_block_2$1(ctx) {
    	let div2;
    	let t0;
    	let div1;
    	let div0;
    	let t1;
    	let current_block_type_index;
    	let if_block1;
    	let div0_class_value;
    	let div2_class_value;
    	let div2_intro;
    	let div2_outro;
    	let current;
    	let mounted;
    	let dispose;
    	const external_slot_template = /*#slots*/ ctx[30].external;
    	const external_slot = create_slot(external_slot_template, ctx, /*$$scope*/ ctx[34], get_external_slot_context);
    	let if_block0 = /*header*/ ctx[3] && create_if_block_4$1(ctx);
    	const if_block_creators = [create_if_block_3$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*body*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			if (external_slot) external_slot.c();
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if_block1.c();
    			attr_dev(div0, "class", div0_class_value = classnames('modal-content', /*contentClassName*/ ctx[9]));
    			add_location(div0, file$5, 237, 12, 5557);
    			attr_dev(div1, "class", /*classes*/ ctx[14]);
    			attr_dev(div1, "role", "document");
    			add_location(div1, file$5, 236, 10, 5487);
    			attr_dev(div2, "arialabelledby", /*labelledBy*/ ctx[5]);

    			attr_dev(div2, "class", div2_class_value = classnames('modal', /*modalClassName*/ ctx[8], {
    				fade: /*fade*/ ctx[10],
    				'position-static': /*staticModal*/ ctx[0]
    			}));

    			attr_dev(div2, "role", "dialog");
    			add_location(div2, file$5, 219, 8, 4921);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);

    			if (external_slot) {
    				external_slot.m(div2, null);
    			}

    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t1);
    			if_blocks[current_block_type_index].m(div0, null);
    			/*div1_binding*/ ctx[31](div1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div2, "introstart", /*introstart_handler*/ ctx[32], false, false, false),
    					listen_dev(div2, "introend", /*onModalOpened*/ ctx[17], false, false, false),
    					listen_dev(div2, "outrostart", /*outrostart_handler*/ ctx[33], false, false, false),
    					listen_dev(div2, "outroend", /*onModalClosed*/ ctx[18], false, false, false),
    					listen_dev(div2, "click", /*handleBackdropClick*/ ctx[16], false, false, false),
    					listen_dev(div2, "mousedown", /*handleBackdropMouseDown*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (external_slot) {
    				if (external_slot.p && (!current || dirty[1] & /*$$scope*/ 8)) {
    					update_slot_base(
    						external_slot,
    						external_slot_template,
    						ctx,
    						/*$$scope*/ ctx[34],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[34])
    						: get_slot_changes(external_slot_template, /*$$scope*/ ctx[34], dirty, get_external_slot_changes),
    						get_external_slot_context
    					);
    				}
    			}

    			if (/*header*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*header*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_4$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(div0, null);
    			}

    			if (!current || dirty[0] & /*contentClassName*/ 512 && div0_class_value !== (div0_class_value = classnames('modal-content', /*contentClassName*/ ctx[9]))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty[0] & /*classes*/ 16384) {
    				attr_dev(div1, "class", /*classes*/ ctx[14]);
    			}

    			if (!current || dirty[0] & /*labelledBy*/ 32) {
    				attr_dev(div2, "arialabelledby", /*labelledBy*/ ctx[5]);
    			}

    			if (!current || dirty[0] & /*modalClassName, fade, staticModal*/ 1281 && div2_class_value !== (div2_class_value = classnames('modal', /*modalClassName*/ ctx[8], {
    				fade: /*fade*/ ctx[10],
    				'position-static': /*staticModal*/ ctx[0]
    			}))) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(external_slot, local);
    			transition_in(if_block0);
    			transition_in(if_block1);

    			add_render_callback(() => {
    				if (div2_outro) div2_outro.end(1);
    				div2_intro = create_in_transition(div2, modalIn, {});
    				div2_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(external_slot, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			if (div2_intro) div2_intro.invalidate();
    			div2_outro = create_out_transition(div2, modalOut, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (external_slot) external_slot.d(detaching);
    			if (if_block0) if_block0.d();
    			if_blocks[current_block_type_index].d();
    			/*div1_binding*/ ctx[31](null);
    			if (detaching && div2_outro) div2_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(219:6) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    // (239:14) {#if header}
    function create_if_block_4$1(ctx) {
    	let modalheader;
    	let current;

    	modalheader = new ModalHeader({
    			props: {
    				toggle: /*toggle*/ ctx[4],
    				$$slots: { default: [create_default_slot_3$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modalheader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modalheader, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modalheader_changes = {};
    			if (dirty[0] & /*toggle*/ 16) modalheader_changes.toggle = /*toggle*/ ctx[4];

    			if (dirty[0] & /*header*/ 8 | dirty[1] & /*$$scope*/ 8) {
    				modalheader_changes.$$scope = { dirty, ctx };
    			}

    			modalheader.$set(modalheader_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modalheader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modalheader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modalheader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(239:14) {#if header}",
    		ctx
    	});

    	return block;
    }

    // (240:16) <ModalHeader {toggle}>
    function create_default_slot_3$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*header*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*header*/ 8) set_data_dev(t, /*header*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$2.name,
    		type: "slot",
    		source: "(240:16) <ModalHeader {toggle}>",
    		ctx
    	});

    	return block;
    }

    // (248:14) {:else}
    function create_else_block$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[30].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[34], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[34],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[34])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[34], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(248:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (244:14) {#if body}
    function create_if_block_3$1(ctx) {
    	let modalbody;
    	let current;

    	modalbody = new ModalBody({
    			props: {
    				$$slots: { default: [create_default_slot_2$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modalbody.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modalbody, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modalbody_changes = {};

    			if (dirty[1] & /*$$scope*/ 8) {
    				modalbody_changes.$$scope = { dirty, ctx };
    			}

    			modalbody.$set(modalbody_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modalbody.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modalbody.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modalbody, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(244:14) {#if body}",
    		ctx
    	});

    	return block;
    }

    // (245:16) <ModalBody>
    function create_default_slot_2$4(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[30].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[34], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[34],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[34])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[34], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$4.name,
    		type: "slot",
    		source: "(245:16) <ModalBody>",
    		ctx
    	});

    	return block;
    }

    // (217:2) <svelte:component this={outer}>
    function create_default_slot_1$5(ctx) {
    	let div;
    	let current;
    	let if_block = /*isOpen*/ ctx[1] && create_if_block_2$1(ctx);

    	let div_levels = [
    		{ class: /*wrapClassName*/ ctx[7] },
    		{ tabindex: "-1" },
    		/*$$restProps*/ ctx[20]
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			set_attributes(div, div_data);
    			add_location(div, file$5, 217, 4, 4835);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*isOpen*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*isOpen*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty[0] & /*wrapClassName*/ 128) && { class: /*wrapClassName*/ ctx[7] },
    				{ tabindex: "-1" },
    				dirty[0] & /*$$restProps*/ 1048576 && /*$$restProps*/ ctx[20]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$5.name,
    		type: "slot",
    		source: "(217:2) <svelte:component this={outer}>",
    		ctx
    	});

    	return block;
    }

    // (258:0) {#if backdrop && !staticModal}
    function create_if_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*outer*/ ctx[13];

    	function switch_props(ctx) {
    		return {
    			props: {
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};

    			if (dirty[0] & /*fade, isOpen*/ 1026 | dirty[1] & /*$$scope*/ 8) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*outer*/ ctx[13])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(258:0) {#if backdrop && !staticModal}",
    		ctx
    	});

    	return block;
    }

    // (259:2) <svelte:component this={outer}>
    function create_default_slot$5(ctx) {
    	let modalbackdrop;
    	let current;

    	modalbackdrop = new ModalBackdrop({
    			props: {
    				fade: /*fade*/ ctx[10],
    				isOpen: /*isOpen*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modalbackdrop.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modalbackdrop, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modalbackdrop_changes = {};
    			if (dirty[0] & /*fade*/ 1024) modalbackdrop_changes.fade = /*fade*/ ctx[10];
    			if (dirty[0] & /*isOpen*/ 2) modalbackdrop_changes.isOpen = /*isOpen*/ ctx[1];
    			modalbackdrop.$set(modalbackdrop_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modalbackdrop.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modalbackdrop.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modalbackdrop, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(259:2) <svelte:component this={outer}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*_isMounted*/ ctx[11] && create_if_block_1$1(ctx);
    	let if_block1 = /*backdrop*/ ctx[6] && !/*staticModal*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*_isMounted*/ ctx[11]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*_isMounted*/ 2048) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*backdrop*/ ctx[6] && !/*staticModal*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*backdrop, staticModal*/ 65) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let openCount = 0;
    const dialogBaseClass = 'modal-dialog';

    function instance$6($$self, $$props, $$invalidate) {
    	let classes;
    	let outer;

    	const omit_props_names = [
    		"class","static","isOpen","autoFocus","body","centered","container","fullscreen","header","scrollable","size","toggle","labelledBy","backdrop","wrapClassName","modalClassName","contentClassName","fade","unmountOnClose","returnFocusAfterClose"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, ['external','default']);
    	const dispatch = createEventDispatcher();
    	let { class: className = '' } = $$props;
    	let { static: staticModal = false } = $$props;
    	let { isOpen = false } = $$props;
    	let { autoFocus = true } = $$props;
    	let { body = false } = $$props;
    	let { centered = false } = $$props;
    	let { container = undefined } = $$props;
    	let { fullscreen = false } = $$props;
    	let { header = undefined } = $$props;
    	let { scrollable = false } = $$props;
    	let { size = '' } = $$props;
    	let { toggle = undefined } = $$props;
    	let { labelledBy = '' } = $$props;
    	let { backdrop = true } = $$props;
    	let { wrapClassName = '' } = $$props;
    	let { modalClassName = '' } = $$props;
    	let { contentClassName = '' } = $$props;
    	let { fade = true } = $$props;
    	let { unmountOnClose = true } = $$props;
    	let { returnFocusAfterClose = true } = $$props;
    	let hasOpened = false;
    	let _isMounted = false;
    	let _triggeringElement;
    	let _originalBodyPadding;
    	let _lastIsOpen = isOpen;
    	let _lastHasOpened = hasOpened;
    	let _dialog;
    	let _mouseDownElement;
    	let _removeEscListener;

    	onMount(() => {
    		if (isOpen) {
    			init();
    			hasOpened = true;
    		}

    		if (hasOpened && autoFocus) {
    			setFocus();
    		}
    	});

    	onDestroy(() => {
    		destroy();

    		if (hasOpened) {
    			close();
    		}
    	});

    	afterUpdate(() => {
    		if (isOpen && !_lastIsOpen) {
    			init();
    			hasOpened = true;
    		}

    		if (autoFocus && hasOpened && !_lastHasOpened) {
    			setFocus();
    		}

    		_lastIsOpen = isOpen;
    		_lastHasOpened = hasOpened;
    	});

    	function setFocus() {
    		if (_dialog && _dialog.parentNode && typeof _dialog.parentNode.focus === 'function') {
    			_dialog.parentNode.focus();
    		}
    	}

    	function init() {
    		try {
    			_triggeringElement = document.activeElement;
    		} catch(err) {
    			_triggeringElement = null;
    		}

    		if (!staticModal) {
    			_originalBodyPadding = getOriginalBodyPadding();
    			conditionallyUpdateScrollbar();

    			if (openCount === 0) {
    				document.body.className = classnames(document.body.className, 'modal-open');
    			}

    			++openCount;
    		}

    		$$invalidate(11, _isMounted = true);
    	}

    	function manageFocusAfterClose() {
    		if (_triggeringElement) {
    			if (typeof _triggeringElement.focus === 'function' && returnFocusAfterClose) {
    				_triggeringElement.focus();
    			}

    			_triggeringElement = null;
    		}
    	}

    	function destroy() {
    		manageFocusAfterClose();
    	}

    	function close() {
    		if (openCount <= 1) {
    			document.body.classList.remove('modal-open');
    		}

    		manageFocusAfterClose();
    		openCount = Math.max(0, openCount - 1);
    		setScrollbarWidth(_originalBodyPadding);
    	}

    	function handleBackdropClick(e) {
    		if (e.target === _mouseDownElement) {
    			e.stopPropagation();

    			if (!isOpen || !backdrop) {
    				return;
    			}

    			const backdropElem = _dialog ? _dialog.parentNode : null;

    			if (backdrop === true && backdropElem && e.target === backdropElem && toggle) {
    				toggle(e);
    			}
    		}
    	}

    	function onModalOpened() {
    		dispatch('open');

    		_removeEscListener = browserEvent(document, 'keydown', event => {
    			if (event.key && event.key === 'Escape') {
    				if (toggle && backdrop === true) toggle(event);
    			}
    		});
    	}

    	function onModalClosed() {
    		dispatch('close');

    		if (_removeEscListener) {
    			_removeEscListener();
    		}

    		if (unmountOnClose) {
    			destroy();
    		}

    		close();

    		if (_isMounted) {
    			hasOpened = false;
    		}

    		$$invalidate(11, _isMounted = false);
    	}

    	function handleBackdropMouseDown(e) {
    		_mouseDownElement = e.target;
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			_dialog = $$value;
    			$$invalidate(12, _dialog);
    		});
    	}

    	const introstart_handler = () => dispatch('opening');
    	const outrostart_handler = () => dispatch('closing');

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(20, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(21, className = $$new_props.class);
    		if ('static' in $$new_props) $$invalidate(0, staticModal = $$new_props.static);
    		if ('isOpen' in $$new_props) $$invalidate(1, isOpen = $$new_props.isOpen);
    		if ('autoFocus' in $$new_props) $$invalidate(22, autoFocus = $$new_props.autoFocus);
    		if ('body' in $$new_props) $$invalidate(2, body = $$new_props.body);
    		if ('centered' in $$new_props) $$invalidate(23, centered = $$new_props.centered);
    		if ('container' in $$new_props) $$invalidate(24, container = $$new_props.container);
    		if ('fullscreen' in $$new_props) $$invalidate(25, fullscreen = $$new_props.fullscreen);
    		if ('header' in $$new_props) $$invalidate(3, header = $$new_props.header);
    		if ('scrollable' in $$new_props) $$invalidate(26, scrollable = $$new_props.scrollable);
    		if ('size' in $$new_props) $$invalidate(27, size = $$new_props.size);
    		if ('toggle' in $$new_props) $$invalidate(4, toggle = $$new_props.toggle);
    		if ('labelledBy' in $$new_props) $$invalidate(5, labelledBy = $$new_props.labelledBy);
    		if ('backdrop' in $$new_props) $$invalidate(6, backdrop = $$new_props.backdrop);
    		if ('wrapClassName' in $$new_props) $$invalidate(7, wrapClassName = $$new_props.wrapClassName);
    		if ('modalClassName' in $$new_props) $$invalidate(8, modalClassName = $$new_props.modalClassName);
    		if ('contentClassName' in $$new_props) $$invalidate(9, contentClassName = $$new_props.contentClassName);
    		if ('fade' in $$new_props) $$invalidate(10, fade = $$new_props.fade);
    		if ('unmountOnClose' in $$new_props) $$invalidate(28, unmountOnClose = $$new_props.unmountOnClose);
    		if ('returnFocusAfterClose' in $$new_props) $$invalidate(29, returnFocusAfterClose = $$new_props.returnFocusAfterClose);
    		if ('$$scope' in $$new_props) $$invalidate(34, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		openCount,
    		classnames,
    		browserEvent,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		afterUpdate,
    		modalIn,
    		modalOut,
    		InlineContainer,
    		ModalBackdrop,
    		ModalBody,
    		ModalHeader,
    		Portal,
    		conditionallyUpdateScrollbar,
    		getOriginalBodyPadding,
    		setScrollbarWidth,
    		dispatch,
    		className,
    		staticModal,
    		isOpen,
    		autoFocus,
    		body,
    		centered,
    		container,
    		fullscreen,
    		header,
    		scrollable,
    		size,
    		toggle,
    		labelledBy,
    		backdrop,
    		wrapClassName,
    		modalClassName,
    		contentClassName,
    		fade,
    		unmountOnClose,
    		returnFocusAfterClose,
    		hasOpened,
    		_isMounted,
    		_triggeringElement,
    		_originalBodyPadding,
    		_lastIsOpen,
    		_lastHasOpened,
    		_dialog,
    		_mouseDownElement,
    		_removeEscListener,
    		setFocus,
    		init,
    		manageFocusAfterClose,
    		destroy,
    		close,
    		handleBackdropClick,
    		onModalOpened,
    		onModalClosed,
    		handleBackdropMouseDown,
    		dialogBaseClass,
    		outer,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(21, className = $$new_props.className);
    		if ('staticModal' in $$props) $$invalidate(0, staticModal = $$new_props.staticModal);
    		if ('isOpen' in $$props) $$invalidate(1, isOpen = $$new_props.isOpen);
    		if ('autoFocus' in $$props) $$invalidate(22, autoFocus = $$new_props.autoFocus);
    		if ('body' in $$props) $$invalidate(2, body = $$new_props.body);
    		if ('centered' in $$props) $$invalidate(23, centered = $$new_props.centered);
    		if ('container' in $$props) $$invalidate(24, container = $$new_props.container);
    		if ('fullscreen' in $$props) $$invalidate(25, fullscreen = $$new_props.fullscreen);
    		if ('header' in $$props) $$invalidate(3, header = $$new_props.header);
    		if ('scrollable' in $$props) $$invalidate(26, scrollable = $$new_props.scrollable);
    		if ('size' in $$props) $$invalidate(27, size = $$new_props.size);
    		if ('toggle' in $$props) $$invalidate(4, toggle = $$new_props.toggle);
    		if ('labelledBy' in $$props) $$invalidate(5, labelledBy = $$new_props.labelledBy);
    		if ('backdrop' in $$props) $$invalidate(6, backdrop = $$new_props.backdrop);
    		if ('wrapClassName' in $$props) $$invalidate(7, wrapClassName = $$new_props.wrapClassName);
    		if ('modalClassName' in $$props) $$invalidate(8, modalClassName = $$new_props.modalClassName);
    		if ('contentClassName' in $$props) $$invalidate(9, contentClassName = $$new_props.contentClassName);
    		if ('fade' in $$props) $$invalidate(10, fade = $$new_props.fade);
    		if ('unmountOnClose' in $$props) $$invalidate(28, unmountOnClose = $$new_props.unmountOnClose);
    		if ('returnFocusAfterClose' in $$props) $$invalidate(29, returnFocusAfterClose = $$new_props.returnFocusAfterClose);
    		if ('hasOpened' in $$props) hasOpened = $$new_props.hasOpened;
    		if ('_isMounted' in $$props) $$invalidate(11, _isMounted = $$new_props._isMounted);
    		if ('_triggeringElement' in $$props) _triggeringElement = $$new_props._triggeringElement;
    		if ('_originalBodyPadding' in $$props) _originalBodyPadding = $$new_props._originalBodyPadding;
    		if ('_lastIsOpen' in $$props) _lastIsOpen = $$new_props._lastIsOpen;
    		if ('_lastHasOpened' in $$props) _lastHasOpened = $$new_props._lastHasOpened;
    		if ('_dialog' in $$props) $$invalidate(12, _dialog = $$new_props._dialog);
    		if ('_mouseDownElement' in $$props) _mouseDownElement = $$new_props._mouseDownElement;
    		if ('_removeEscListener' in $$props) _removeEscListener = $$new_props._removeEscListener;
    		if ('outer' in $$props) $$invalidate(13, outer = $$new_props.outer);
    		if ('classes' in $$props) $$invalidate(14, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*className, size, fullscreen, centered, scrollable*/ 245366784) {
    			$$invalidate(14, classes = classnames(dialogBaseClass, className, {
    				[`modal-${size}`]: size,
    				'modal-fullscreen': fullscreen === true,
    				[`modal-fullscreen-${fullscreen}-down`]: fullscreen && typeof fullscreen === 'string',
    				[`${dialogBaseClass}-centered`]: centered,
    				[`${dialogBaseClass}-scrollable`]: scrollable
    			}));
    		}

    		if ($$self.$$.dirty[0] & /*container, staticModal*/ 16777217) {
    			$$invalidate(13, outer = container === 'inline' || staticModal
    			? InlineContainer
    			: Portal);
    		}
    	};

    	return [
    		staticModal,
    		isOpen,
    		body,
    		header,
    		toggle,
    		labelledBy,
    		backdrop,
    		wrapClassName,
    		modalClassName,
    		contentClassName,
    		fade,
    		_isMounted,
    		_dialog,
    		outer,
    		classes,
    		dispatch,
    		handleBackdropClick,
    		onModalOpened,
    		onModalClosed,
    		handleBackdropMouseDown,
    		$$restProps,
    		className,
    		autoFocus,
    		centered,
    		container,
    		fullscreen,
    		scrollable,
    		size,
    		unmountOnClose,
    		returnFocusAfterClose,
    		slots,
    		div1_binding,
    		introstart_handler,
    		outrostart_handler,
    		$$scope
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$6,
    			create_fragment$6,
    			safe_not_equal,
    			{
    				class: 21,
    				static: 0,
    				isOpen: 1,
    				autoFocus: 22,
    				body: 2,
    				centered: 23,
    				container: 24,
    				fullscreen: 25,
    				header: 3,
    				scrollable: 26,
    				size: 27,
    				toggle: 4,
    				labelledBy: 5,
    				backdrop: 6,
    				wrapClassName: 7,
    				modalClassName: 8,
    				contentClassName: 9,
    				fade: 10,
    				unmountOnClose: 28,
    				returnFocusAfterClose: 29
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get class() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get static() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set static(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoFocus() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoFocus(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get body() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set body(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centered() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centered(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get container() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set container(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fullscreen() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fullscreen(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get header() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set header(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollable() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollable(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggle() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggle(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelledBy() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelledBy(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backdrop() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backdrop(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapClassName() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapClassName(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modalClassName() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalClassName(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contentClassName() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contentClassName(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fade() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fade(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unmountOnClose() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unmountOnClose(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get returnFocusAfterClose() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set returnFocusAfterClose(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\ModalFooter.svelte generated by Svelte v3.44.1 */
    const file$4 = "node_modules\\sveltestrap\\src\\ModalFooter.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let div_levels = [/*$$restProps*/ ctx[1], { class: /*classes*/ ctx[0] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$4, 9, 0, 167);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1],
    				(!current || dirty & /*classes*/ 1) && { class: /*classes*/ ctx[0] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let classes;
    	const omit_props_names = ["class"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ModalFooter', slots, ['default']);
    	let { class: className = '' } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('$$scope' in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ classnames, className, classes });

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(2, className = $$new_props.className);
    		if ('classes' in $$props) $$invalidate(0, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className*/ 4) {
    			$$invalidate(0, classes = classnames(className, 'modal-footer'));
    		}
    	};

    	return [classes, $$restProps, className, $$scope, slots];
    }

    class ModalFooter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { class: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModalFooter",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get class() {
    		throw new Error("<ModalFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ModalFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Subject.svelte generated by Svelte v3.44.1 */
    const file$3 = "src\\Subject.svelte";

    // (39:4) <ModalHeader>
    function create_default_slot_11(ctx) {
    	let t_value = (/*stroom1*/ ctx[5] || /*stroom2*/ ctx[6]
    	? 'Pauze'
    	: 'Grote pauze') + "";

    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(39:4) <ModalHeader>",
    		ctx
    	});

    	return block;
    }

    // (40:4) <ModalBody>
    function create_default_slot_10(ctx) {
    	let t0;
    	let t1_value = new Date(/*subjects*/ ctx[1][/*subjects*/ ctx[1].indexOf(/*subject*/ ctx[0]) - 1].end).toLocaleTimeString().substring(0, 5) + "";
    	let t1;
    	let t2;
    	let br;
    	let t3;
    	let t4_value = new Date(/*subject*/ ctx[0].start).toLocaleTimeString().substring(0, 5) + "";
    	let t4;

    	const block = {
    		c: function create() {
    			t0 = text("Deze pauze begint om ");
    			t1 = text(t1_value);
    			t2 = text(", ");
    			br = element("br");
    			t3 = text("\r\n        En eindigt om ");
    			t4 = text(t4_value);
    			add_location(br, file$3, 40, 123, 2424);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, t4, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subjects, subject*/ 3 && t1_value !== (t1_value = new Date(/*subjects*/ ctx[1][/*subjects*/ ctx[1].indexOf(/*subject*/ ctx[0]) - 1].end).toLocaleTimeString().substring(0, 5) + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*subject*/ 1 && t4_value !== (t4_value = new Date(/*subject*/ ctx[0].start).toLocaleTimeString().substring(0, 5) + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(t4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(40:4) <ModalBody>",
    		ctx
    	});

    	return block;
    }

    // (38:0) <Modal isOpen={pauzeOpen} toggle={togglePauze}>
    function create_default_slot_9(ctx) {
    	let modalheader;
    	let t;
    	let modalbody;
    	let current;

    	modalheader = new ModalHeader({
    			props: {
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modalbody = new ModalBody({
    			props: {
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modalheader.$$.fragment);
    			t = space();
    			create_component(modalbody.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modalheader, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(modalbody, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modalheader_changes = {};

    			if (dirty & /*$$scope*/ 2097152) {
    				modalheader_changes.$$scope = { dirty, ctx };
    			}

    			modalheader.$set(modalheader_changes);
    			const modalbody_changes = {};

    			if (dirty & /*$$scope, subject, subjects*/ 2097155) {
    				modalbody_changes.$$scope = { dirty, ctx };
    			}

    			modalbody.$set(modalbody_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modalheader.$$.fragment, local);
    			transition_in(modalbody.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modalheader.$$.fragment, local);
    			transition_out(modalbody.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modalheader, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(modalbody, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(38:0) <Modal isOpen={pauzeOpen} toggle={togglePauze}>",
    		ctx
    	});

    	return block;
    }

    // (49:51) 
    function create_if_block_7(ctx) {
    	let li;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Pauze";
    			attr_dev(li, "class", "list-group-item");
    			add_location(li, file$3, 49, 4, 2789);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", /*togglePauze*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(49:51) ",
    		ctx
    	});

    	return block;
    }

    // (45:0) {#if ((grotePauze1 || grotePauze2) && !minirooster) || (miniroosterPauze1 || miniroosterPauze2)}
    function create_if_block_6(ctx) {
    	let li;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Grote pauze";
    			attr_dev(li, "class", "list-group-item");
    			add_location(li, file$3, 45, 4, 2647);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", /*togglePauze*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(45:0) {#if ((grotePauze1 || grotePauze2) && !minirooster) || (miniroosterPauze1 || miniroosterPauze2)}",
    		ctx
    	});

    	return block;
    }

    // (55:4) <Badge pill color="primary">
    function create_default_slot_8(ctx) {
    	let t_value = /*subject*/ ctx[0].classhour + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subject*/ 1 && t_value !== (t_value = /*subject*/ ctx[0].classhour + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(55:4) <Badge pill color=\\\"primary\\\">",
    		ctx
    	});

    	return block;
    }

    // (57:4) {#if subject.homework}
    function create_if_block_5(ctx) {
    	let badge;
    	let current;

    	badge = new Badge({
    			props: {
    				pill: true,
    				color: "info",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(badge.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(badge, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(badge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(badge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(badge, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(57:4) {#if subject.homework}",
    		ctx
    	});

    	return block;
    }

    // (58:8) <Badge pill color="info">
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Huiswerk");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(58:8) <Badge pill color=\\\"info\\\">",
    		ctx
    	});

    	return block;
    }

    // (60:4) {#if subject.toets}
    function create_if_block_4(ctx) {
    	let badge;
    	let current;

    	badge = new Badge({
    			props: {
    				pill: true,
    				color: "info",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(badge.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(badge, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(badge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(badge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(badge, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(60:4) {#if subject.toets}",
    		ctx
    	});

    	return block;
    }

    // (61:8) <Badge pill color="info">
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Toets");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(61:8) <Badge pill color=\\\"info\\\">",
    		ctx
    	});

    	return block;
    }

    // (66:8) <Badge pill color="primary">
    function create_default_slot_5(ctx) {
    	let t_value = /*subject*/ ctx[0].classhour + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subject*/ 1 && t_value !== (t_value = /*subject*/ ctx[0].classhour + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(66:8) <Badge pill color=\\\"primary\\\">",
    		ctx
    	});

    	return block;
    }

    // (68:8) {#if subject.homework}
    function create_if_block_3(ctx) {
    	let badge;
    	let current;

    	badge = new Badge({
    			props: {
    				pill: true,
    				color: "info",
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(badge.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(badge, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(badge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(badge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(badge, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(68:8) {#if subject.homework}",
    		ctx
    	});

    	return block;
    }

    // (69:12) <Badge pill color="info">
    function create_default_slot_4$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Huiswerk");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(69:12) <Badge pill color=\\\"info\\\">",
    		ctx
    	});

    	return block;
    }

    // (71:8) {#if subject.toets}
    function create_if_block_2(ctx) {
    	let badge;
    	let current;

    	badge = new Badge({
    			props: {
    				pill: true,
    				color: "info",
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(badge.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(badge, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(badge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(badge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(badge, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(71:8) {#if subject.toets}",
    		ctx
    	});

    	return block;
    }

    // (72:12) <Badge pill color="info">
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Toets");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(72:12) <Badge pill color=\\\"info\\\">",
    		ctx
    	});

    	return block;
    }

    // (65:4) <ModalHeader>
    function create_default_slot_2$3(ctx) {
    	let badge;
    	let t0;
    	let t1_value = /*subject*/ ctx[0].title + "";
    	let t1;
    	let t2;
    	let t3;
    	let if_block1_anchor;
    	let current;

    	badge = new Badge({
    			props: {
    				pill: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block0 = /*subject*/ ctx[0].homework && create_if_block_3(ctx);
    	let if_block1 = /*subject*/ ctx[0].toets && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			create_component(badge.$$.fragment);
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(badge, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const badge_changes = {};

    			if (dirty & /*$$scope, subject*/ 2097153) {
    				badge_changes.$$scope = { dirty, ctx };
    			}

    			badge.$set(badge_changes);
    			if ((!current || dirty & /*subject*/ 1) && t1_value !== (t1_value = /*subject*/ ctx[0].title + "")) set_data_dev(t1, t1_value);

    			if (/*subject*/ ctx[0].homework) {
    				if (if_block0) {
    					if (dirty & /*subject*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t3.parentNode, t3);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*subject*/ ctx[0].toets) {
    				if (if_block1) {
    					if (dirty & /*subject*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(badge.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(badge.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(badge, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(65:4) <ModalHeader>",
    		ctx
    	});

    	return block;
    }

    // (82:12) {#if subject.location}
    function create_if_block_1(ctx) {
    	let t0;
    	let t1_value = /*subject*/ ctx[0].location + "";
    	let t1;
    	let br;

    	const block = {
    		c: function create() {
    			t0 = text("Het vak is te vinden in lokaal ");
    			t1 = text(t1_value);
    			br = element("br");
    			add_location(br, file$3, 81, 83, 3936);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subject*/ 1 && t1_value !== (t1_value = /*subject*/ ctx[0].location + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(82:12) {#if subject.location}",
    		ctx
    	});

    	return block;
    }

    // (83:8) {#if subject.docent}
    function create_if_block$1(ctx) {
    	let t0;
    	let t1_value = /*subject*/ ctx[0].docent + "";
    	let t1;
    	let t2;
    	let br;

    	const block = {
    		c: function create() {
    			t0 = text("De docent is ");
    			t1 = text(t1_value);
    			t2 = text(".");
    			br = element("br");
    			add_location(br, file$3, 82, 58, 4005);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subject*/ 1 && t1_value !== (t1_value = /*subject*/ ctx[0].docent + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(83:8) {#if subject.docent}",
    		ctx
    	});

    	return block;
    }

    // (75:4) <ModalBody          >
    function create_default_slot_1$4(ctx) {
    	let t0_value = (/*subject*/ ctx[0].description
    	? `Het vak ${/*subject*/ ctx[0].description}`
    	: 'Dit vak') + "";

    	let t0;
    	let t1;
    	let t2_value = new Date(/*subject*/ ctx[0].start).toLocaleTimeString().substring(0, 5) + "";
    	let t2;
    	let t3;
    	let br0;
    	let t4;
    	let t5_value = new Date(/*subject*/ ctx[0].end).toLocaleTimeString().substring(0, 5) + "";
    	let t5;
    	let t6;
    	let br1;
    	let t7;
    	let t8;
    	let t9;
    	let t10_value = (/*subject*/ ctx[0].toets ? 'een' : 'geen') + "";
    	let t10;
    	let t11;
    	let br2;
    	let t12;
    	let t13_value = (/*subject*/ ctx[0].homework ? '' : 'geen') + "";
    	let t13;
    	let t14;
    	let if_block0 = /*subject*/ ctx[0].location && create_if_block_1(ctx);
    	let if_block1 = /*subject*/ ctx[0].docent && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" begint\r\n        om ");
    			t2 = text(t2_value);
    			t3 = text(",\r\n        ");
    			br0 = element("br");
    			t4 = text("\r\n        En eindigt om ");
    			t5 = text(t5_value);
    			t6 = text(".");
    			br1 = element("br");
    			t7 = space();
    			if (if_block0) if_block0.c();
    			t8 = space();
    			if (if_block1) if_block1.c();
    			t9 = text("\r\n        Dit vak heeft ");
    			t10 = text(t10_value);
    			t11 = text(" toets.");
    			br2 = element("br");
    			t12 = text("\r\n        En heeft ");
    			t13 = text(t13_value);
    			t14 = text(" opgegeven huiswerk.");
    			add_location(br0, file$3, 77, 8, 3726);
    			add_location(br1, file$3, 80, 30, 3845);
    			add_location(br2, file$3, 83, 61, 4079);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t7, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, t14, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subject*/ 1 && t0_value !== (t0_value = (/*subject*/ ctx[0].description
    			? `Het vak ${/*subject*/ ctx[0].description}`
    			: 'Dit vak') + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*subject*/ 1 && t2_value !== (t2_value = new Date(/*subject*/ ctx[0].start).toLocaleTimeString().substring(0, 5) + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*subject*/ 1 && t5_value !== (t5_value = new Date(/*subject*/ ctx[0].end).toLocaleTimeString().substring(0, 5) + "")) set_data_dev(t5, t5_value);

    			if (/*subject*/ ctx[0].location) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(t8.parentNode, t8);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*subject*/ ctx[0].docent) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(t9.parentNode, t9);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*subject*/ 1 && t10_value !== (t10_value = (/*subject*/ ctx[0].toets ? 'een' : 'geen') + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*subject*/ 1 && t13_value !== (t13_value = (/*subject*/ ctx[0].homework ? '' : 'geen') + "")) set_data_dev(t13, t13_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t7);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(t14);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(75:4) <ModalBody          >",
    		ctx
    	});

    	return block;
    }

    // (64:0) <Modal {isOpen} {toggle}>
    function create_default_slot$4(ctx) {
    	let modalheader;
    	let t;
    	let modalbody;
    	let current;

    	modalheader = new ModalHeader({
    			props: {
    				$$slots: { default: [create_default_slot_2$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modalbody = new ModalBody({
    			props: {
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modalheader.$$.fragment);
    			t = space();
    			create_component(modalbody.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modalheader, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(modalbody, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modalheader_changes = {};

    			if (dirty & /*$$scope, subject*/ 2097153) {
    				modalheader_changes.$$scope = { dirty, ctx };
    			}

    			modalheader.$set(modalheader_changes);
    			const modalbody_changes = {};

    			if (dirty & /*$$scope, subject*/ 2097153) {
    				modalbody_changes.$$scope = { dirty, ctx };
    			}

    			modalbody.$set(modalbody_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modalheader.$$.fragment, local);
    			transition_in(modalbody.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modalheader.$$.fragment, local);
    			transition_out(modalbody.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modalheader, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(modalbody, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(64:0) <Modal {isOpen} {toggle}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let modal0;
    	let t0;
    	let t1;
    	let li;
    	let badge;
    	let t2;
    	let t3_value = /*subject*/ ctx[0].title + "";
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let modal1;
    	let current;
    	let mounted;
    	let dispose;

    	modal0 = new Modal({
    			props: {
    				isOpen: /*pauzeOpen*/ ctx[3],
    				toggle: /*togglePauze*/ ctx[12],
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function select_block_type(ctx, dirty) {
    		if ((/*grotePauze1*/ ctx[7] || /*grotePauze2*/ ctx[8]) && !/*minirooster*/ ctx[9] || (/*miniroosterPauze1*/ ctx[10] || /*miniroosterPauze2*/ ctx[11])) return create_if_block_6;
    		if ((/*stroom1*/ ctx[5] || /*stroom2*/ ctx[6]) && !/*minirooster*/ ctx[9]) return create_if_block_7;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);

    	badge = new Badge({
    			props: {
    				pill: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block1 = /*subject*/ ctx[0].homework && create_if_block_5(ctx);
    	let if_block2 = /*subject*/ ctx[0].toets && create_if_block_4(ctx);

    	modal1 = new Modal({
    			props: {
    				isOpen: /*isOpen*/ ctx[2],
    				toggle: /*toggle*/ ctx[4],
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal0.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			li = element("li");
    			create_component(badge.$$.fragment);
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			if (if_block2) if_block2.c();
    			t6 = space();
    			create_component(modal1.$$.fragment);
    			attr_dev(li, "class", "list-group-item");
    			add_location(li, file$3, 53, 0, 2875);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, li, anchor);
    			mount_component(badge, li, null);
    			append_dev(li, t2);
    			append_dev(li, t3);
    			append_dev(li, t4);
    			if (if_block1) if_block1.m(li, null);
    			append_dev(li, t5);
    			if (if_block2) if_block2.m(li, null);
    			insert_dev(target, t6, anchor);
    			mount_component(modal1, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(li, "click", /*toggle*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const modal0_changes = {};
    			if (dirty & /*pauzeOpen*/ 8) modal0_changes.isOpen = /*pauzeOpen*/ ctx[3];

    			if (dirty & /*$$scope, subject, subjects*/ 2097155) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			if (if_block0) if_block0.p(ctx, dirty);
    			const badge_changes = {};

    			if (dirty & /*$$scope, subject*/ 2097153) {
    				badge_changes.$$scope = { dirty, ctx };
    			}

    			badge.$set(badge_changes);
    			if ((!current || dirty & /*subject*/ 1) && t3_value !== (t3_value = /*subject*/ ctx[0].title + "")) set_data_dev(t3, t3_value);

    			if (/*subject*/ ctx[0].homework) {
    				if (if_block1) {
    					if (dirty & /*subject*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_5(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(li, t5);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*subject*/ ctx[0].toets) {
    				if (if_block2) {
    					if (dirty & /*subject*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_4(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(li, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			const modal1_changes = {};
    			if (dirty & /*isOpen*/ 4) modal1_changes.isOpen = /*isOpen*/ ctx[2];

    			if (dirty & /*$$scope, subject*/ 2097153) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(badge.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(modal1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(badge.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(modal1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t0);

    			if (if_block0) {
    				if_block0.d(detaching);
    			}

    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(li);
    			destroy_component(badge);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (detaching) detach_dev(t6);
    			destroy_component(modal1, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Subject', slots, []);
    	let isOpen = false;
    	const toggle = () => $$invalidate(2, isOpen = !isOpen);
    	let { subject } = $$props;
    	let { subjects } = $$props;
    	let lesuur = parseInt(subject.classhour);
    	let location = parseInt(subject.location);
    	let stroom1locatie = location == 7 || location == 8 || subject.description == 'lichamelijke opvoeding' || location >= 104 && location <= 127 || location >= 228 && location <= 258;
    	let stroom2locatie = location >= 51 && location <= 88 || location >= 201 && location <= 227 || location >= 301 && location <= 330;
    	let stroom1tijd = lesuur == 4 || lesuur == 8;
    	if (stroom1tijd && stroom1locatie && subjects[subjects.indexOf(subject) + 1]) subjects[subjects.indexOf(subject) + 1].dontAllowStroom2 = true;
    	let stroom2tijd = lesuur == 5 || lesuur == 9;
    	let stroom1 = stroom1tijd && stroom1locatie;
    	let stroom2 = stroom2tijd && stroom2locatie && !subject.dontAllowStroom2;
    	let grotePauze1 = stroom1locatie && lesuur == 6;
    	let grotePauze2 = stroom2locatie && lesuur == 7 && !subject.dontAllowStroom2;
    	let start = new Date(subject.start);
    	let end = new Date(subject.end);
    	let minirooster = start.getMinutes() == end.getMinutes() && start.getHours() + 1 == end.getHours() || 60 * start.getHours() + start.getMinutes() + 30 == 60 * end.getHours() + end.getMinutes();
    	let miniroosterPauze1 = lesuur == 6 && start.toLocaleTimeString() == '10:50:00' && stroom1locatie && minirooster;
    	let miniroosterPauze2 = lesuur == 7 && start.toLocaleTimeString() == '11:20:00' && stroom2locatie && minirooster;
    	let pauzeOpen = false;
    	let togglePauze = () => $$invalidate(3, pauzeOpen = !pauzeOpen);
    	if (stroom1 && !minirooster) subject.start += 450000; else if (grotePauze1 || miniroosterPauze1) subject.start += 900000; else if (stroom2 && !minirooster) subjects[subjects.indexOf(subject) - 1].end -= 450000; else if (grotePauze2 || miniroosterPauze2) subjects[subjects.indexOf(subject) - 1].end -= 900000;
    	const writable_props = ['subject', 'subjects'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Subject> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('subject' in $$props) $$invalidate(0, subject = $$props.subject);
    		if ('subjects' in $$props) $$invalidate(1, subjects = $$props.subjects);
    	};

    	$$self.$capture_state = () => ({
    		Modal,
    		ModalHeader,
    		ModalBody,
    		Badge,
    		isOpen,
    		toggle,
    		subject,
    		subjects,
    		lesuur,
    		location,
    		stroom1locatie,
    		stroom2locatie,
    		stroom1tijd,
    		stroom2tijd,
    		stroom1,
    		stroom2,
    		grotePauze1,
    		grotePauze2,
    		start,
    		end,
    		minirooster,
    		miniroosterPauze1,
    		miniroosterPauze2,
    		pauzeOpen,
    		togglePauze
    	});

    	$$self.$inject_state = $$props => {
    		if ('isOpen' in $$props) $$invalidate(2, isOpen = $$props.isOpen);
    		if ('subject' in $$props) $$invalidate(0, subject = $$props.subject);
    		if ('subjects' in $$props) $$invalidate(1, subjects = $$props.subjects);
    		if ('lesuur' in $$props) lesuur = $$props.lesuur;
    		if ('location' in $$props) location = $$props.location;
    		if ('stroom1locatie' in $$props) stroom1locatie = $$props.stroom1locatie;
    		if ('stroom2locatie' in $$props) stroom2locatie = $$props.stroom2locatie;
    		if ('stroom1tijd' in $$props) stroom1tijd = $$props.stroom1tijd;
    		if ('stroom2tijd' in $$props) stroom2tijd = $$props.stroom2tijd;
    		if ('stroom1' in $$props) $$invalidate(5, stroom1 = $$props.stroom1);
    		if ('stroom2' in $$props) $$invalidate(6, stroom2 = $$props.stroom2);
    		if ('grotePauze1' in $$props) $$invalidate(7, grotePauze1 = $$props.grotePauze1);
    		if ('grotePauze2' in $$props) $$invalidate(8, grotePauze2 = $$props.grotePauze2);
    		if ('start' in $$props) start = $$props.start;
    		if ('end' in $$props) end = $$props.end;
    		if ('minirooster' in $$props) $$invalidate(9, minirooster = $$props.minirooster);
    		if ('miniroosterPauze1' in $$props) $$invalidate(10, miniroosterPauze1 = $$props.miniroosterPauze1);
    		if ('miniroosterPauze2' in $$props) $$invalidate(11, miniroosterPauze2 = $$props.miniroosterPauze2);
    		if ('pauzeOpen' in $$props) $$invalidate(3, pauzeOpen = $$props.pauzeOpen);
    		if ('togglePauze' in $$props) $$invalidate(12, togglePauze = $$props.togglePauze);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		subject,
    		subjects,
    		isOpen,
    		pauzeOpen,
    		toggle,
    		stroom1,
    		stroom2,
    		grotePauze1,
    		grotePauze2,
    		minirooster,
    		miniroosterPauze1,
    		miniroosterPauze2,
    		togglePauze
    	];
    }

    class Subject extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { subject: 0, subjects: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Subject",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*subject*/ ctx[0] === undefined && !('subject' in props)) {
    			console.warn("<Subject> was created without expected prop 'subject'");
    		}

    		if (/*subjects*/ ctx[1] === undefined && !('subjects' in props)) {
    			console.warn("<Subject> was created without expected prop 'subjects'");
    		}
    	}

    	get subject() {
    		throw new Error("<Subject>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subject(value) {
    		throw new Error("<Subject>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subjects() {
    		throw new Error("<Subject>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subjects(value) {
    		throw new Error("<Subject>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Home.svelte generated by Svelte v3.44.1 */

    const { console: console_1 } = globals;

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (60:12) {#each day.subjects as subject}
    function create_each_block_1(ctx) {
    	let subject;
    	let current;

    	subject = new Subject({
    			props: {
    				subjects: /*day*/ ctx[1].subjects,
    				subject: /*subject*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(subject.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(subject, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const subject_changes = {};
    			if (dirty & /*days*/ 1) subject_changes.subjects = /*day*/ ctx[1].subjects;
    			if (dirty & /*days*/ 1) subject_changes.subject = /*subject*/ ctx[4];
    			subject.$set(subject_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(subject.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subject.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(subject, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(60:12) {#each day.subjects as subject}",
    		ctx
    	});

    	return block;
    }

    // (38:8) <AccordionItem              active={new Date(day.day).toLocaleDateString() ==                  new Date().toLocaleDateString()}              class="list-group"              header={new Date(day.day)                  .toLocaleString('nl-NL', {                      weekday: 'long',                      year: 'numeric',                      month: 'long',                      day: 'numeric',                  })                  .charAt(0)                  .toUpperCase() +                  new Date(day.day)                      .toLocaleString('nl-NL', {                          weekday: 'long',                          year: 'numeric',                          month: 'long',                          day: 'numeric',                      })                      .slice(1)}          >
    function create_default_slot_1$3(ctx) {
    	let t;
    	let current;
    	let each_value_1 = /*day*/ ctx[1].subjects;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*days*/ 1) {
    				each_value_1 = /*day*/ ctx[1].subjects;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(38:8) <AccordionItem              active={new Date(day.day).toLocaleDateString() ==                  new Date().toLocaleDateString()}              class=\\\"list-group\\\"              header={new Date(day.day)                  .toLocaleString('nl-NL', {                      weekday: 'long',                      year: 'numeric',                      month: 'long',                      day: 'numeric',                  })                  .charAt(0)                  .toUpperCase() +                  new Date(day.day)                      .toLocaleString('nl-NL', {                          weekday: 'long',                          year: 'numeric',                          month: 'long',                          day: 'numeric',                      })                      .slice(1)}          >",
    		ctx
    	});

    	return block;
    }

    // (37:4) {#each days as day}
    function create_each_block(ctx) {
    	let accordionitem;
    	let current;

    	accordionitem = new AccordionItem({
    			props: {
    				active: new Date(/*day*/ ctx[1].day).toLocaleDateString() == new Date().toLocaleDateString(),
    				class: "list-group",
    				header: new Date(/*day*/ ctx[1].day).toLocaleString('nl-NL', {
    					weekday: 'long',
    					year: 'numeric',
    					month: 'long',
    					day: 'numeric'
    				}).charAt(0).toUpperCase() + new Date(/*day*/ ctx[1].day).toLocaleString('nl-NL', {
    					weekday: 'long',
    					year: 'numeric',
    					month: 'long',
    					day: 'numeric'
    				}).slice(1),
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(accordionitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(accordionitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const accordionitem_changes = {};
    			if (dirty & /*days*/ 1) accordionitem_changes.active = new Date(/*day*/ ctx[1].day).toLocaleDateString() == new Date().toLocaleDateString();

    			if (dirty & /*days*/ 1) accordionitem_changes.header = new Date(/*day*/ ctx[1].day).toLocaleString('nl-NL', {
    				weekday: 'long',
    				year: 'numeric',
    				month: 'long',
    				day: 'numeric'
    			}).charAt(0).toUpperCase() + new Date(/*day*/ ctx[1].day).toLocaleString('nl-NL', {
    				weekday: 'long',
    				year: 'numeric',
    				month: 'long',
    				day: 'numeric'
    			}).slice(1);

    			if (dirty & /*$$scope, days*/ 129) {
    				accordionitem_changes.$$scope = { dirty, ctx };
    			}

    			accordionitem.$set(accordionitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(accordionitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(accordionitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(accordionitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(37:4) {#each days as day}",
    		ctx
    	});

    	return block;
    }

    // (36:0) <Accordion>
    function create_default_slot$3(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*days*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Date, days*/ 1) {
    				each_value = /*days*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(36:0) <Accordion>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let link;
    	let t;
    	let accordion;
    	let current;

    	link = new Link({
    			props: {
    				to: "login",
    				class: "login",
    				style: { visibility: 'hidden' }
    			},
    			$$inline: true
    		});

    	accordion = new Accordion({
    			props: {
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(link.$$.fragment);
    			t = space();
    			create_component(accordion.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(link, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(accordion, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const accordion_changes = {};

    			if (dirty & /*$$scope, days*/ 129) {
    				accordion_changes.$$scope = { dirty, ctx };
    			}

    			accordion.$set(accordion_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			transition_in(accordion.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			transition_out(accordion.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(link, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(accordion, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let days = [];

    	onMount(async () => {
    		// if(!localStorage.getItem('username') || !localStorage.getItem('password')) document.querySelector('.login').click();
    		if (localStorage.getItem('day') == new Date().toLocaleDateString() && localStorage.getItem('days')) return $$invalidate(0, days = JSON.parse(localStorage.getItem('days'))); else localStorage.setItem('day', new Date().toLocaleDateString());

    		if (localStorage.getItem('days')) $$invalidate(0, days = JSON.parse(localStorage.getItem('days')));
    		if (!navigator.onLine) return;

    		let res = await fetch('https://hoogeland-pauzes.glitch.me/get', {
    			headers: new Headers({ 'content-type': 'application/json' }),
    			mode: 'cors',
    			method: 'POST',
    			// body: JSON.stringify({ username: localStorage.getItem('username'), password: localStorage.getItem('password')})
    			body: JSON.stringify({ username: 'hv1d' })
    		});

    		let text = await res.text();

    		// if(text == 'failed') {
    		//     document.querySelector('.login').click();
    		//     return;
    		// };
    		localStorage.setItem('days', text);

    		console.log(JSON.parse(text));
    		$$invalidate(0, days = JSON.parse(text));
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		Link,
    		Subject,
    		Accordion,
    		AccordionItem,
    		days
    	});

    	$$self.$inject_state = $$props => {
    		if ('days' in $$props) $$invalidate(0, days = $$props.days);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [days];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Login.svelte generated by Svelte v3.44.1 */

    const file$2 = "src\\Login.svelte";

    // (77:4) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Log in of maak een nieuw account om door te gaan");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(77:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (75:4) {#if navigator.userAgentData.mobile}
    function create_if_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Log in om door te gaan.");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(75:4) {#if navigator.userAgentData.mobile}",
    		ctx
    	});

    	return block;
    }

    // (81:0) <FormGroup on:sumbit={login}>
    function create_default_slot_4(ctx) {
    	let input0;
    	let updating_value;
    	let t;
    	let input1;
    	let updating_value_1;
    	let current;

    	function input0_value_binding(value) {
    		/*input0_value_binding*/ ctx[7](value);
    	}

    	let input0_props = {
    		type: "number",
    		placeholder: "Leerlingnummer",
    		invalid: /*invalid*/ ctx[3],
    		feedback: "Voer een geldig leerlingnummer in"
    	};

    	if (/*username*/ ctx[1] !== void 0) {
    		input0_props.value = /*username*/ ctx[1];
    	}

    	input0 = new Input({ props: input0_props, $$inline: true });
    	binding_callbacks.push(() => bind(input0, 'value', input0_value_binding));

    	function input1_value_binding(value) {
    		/*input1_value_binding*/ ctx[8](value);
    	}

    	let input1_props = {
    		type: "password",
    		placeholder: "Wachtwoord",
    		invalid: /*invalid*/ ctx[3],
    		feedback: "Voer een geldig wachtwoord in"
    	};

    	if (/*password*/ ctx[2] !== void 0) {
    		input1_props.value = /*password*/ ctx[2];
    	}

    	input1 = new Input({ props: input1_props, $$inline: true });
    	binding_callbacks.push(() => bind(input1, 'value', input1_value_binding));

    	const block = {
    		c: function create() {
    			create_component(input0.$$.fragment);
    			t = space();
    			create_component(input1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(input1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input0_changes = {};
    			if (dirty & /*invalid*/ 8) input0_changes.invalid = /*invalid*/ ctx[3];

    			if (!updating_value && dirty & /*username*/ 2) {
    				updating_value = true;
    				input0_changes.value = /*username*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			input0.$set(input0_changes);
    			const input1_changes = {};
    			if (dirty & /*invalid*/ 8) input1_changes.invalid = /*invalid*/ ctx[3];

    			if (!updating_value_1 && dirty & /*password*/ 4) {
    				updating_value_1 = true;
    				input1_changes.value = /*password*/ ctx[2];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			input1.$set(input1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input0.$$.fragment, local);
    			transition_in(input1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input0.$$.fragment, local);
    			transition_out(input1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(input1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(81:0) <FormGroup on:sumbit={login}>",
    		ctx
    	});

    	return block;
    }

    // (100:4) <ModalHeader toggle={newAccountToggle}          >
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Weet je zeker dat je een nieuw account aan wilt maken?");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(100:4) <ModalHeader toggle={newAccountToggle}          >",
    		ctx
    	});

    	return block;
    }

    // (103:8) <ModalBody>
    function create_default_slot_2$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("En dat je het wachtwoord nog weet!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(103:8) <ModalBody>",
    		ctx
    	});

    	return block;
    }

    // (106:4) <ModalFooter>
    function create_default_slot_1$2(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Ja";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Nee";
    			attr_dev(button0, "class", "btn btn-primary");
    			add_location(button0, file$2, 106, 8, 3958);
    			attr_dev(button1, "class", "btn btn-secondary");
    			add_location(button1, file$2, 107, 8, 4025);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*ja*/ ctx[6], false, false, false),
    					listen_dev(button1, "click", /*newAccountToggle*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(106:4) <ModalFooter>",
    		ctx
    	});

    	return block;
    }

    // (99:0) <Modal isOpen={newAccount} toggle={newAccountToggle}>
    function create_default_slot$2(ctx) {
    	let modalheader;
    	let t0;
    	let modalbody;
    	let t1;
    	let modalfooter;
    	let current;

    	modalheader = new ModalHeader({
    			props: {
    				toggle: /*newAccountToggle*/ ctx[4],
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modalbody = new ModalBody({
    			props: {
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modalfooter = new ModalFooter({
    			props: {
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modalheader.$$.fragment);
    			t0 = space();
    			create_component(modalbody.$$.fragment);
    			t1 = space();
    			create_component(modalfooter.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modalheader, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modalbody, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modalfooter, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modalheader_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				modalheader_changes.$$scope = { dirty, ctx };
    			}

    			modalheader.$set(modalheader_changes);
    			const modalbody_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				modalbody_changes.$$scope = { dirty, ctx };
    			}

    			modalbody.$set(modalbody_changes);
    			const modalfooter_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				modalfooter_changes.$$scope = { dirty, ctx };
    			}

    			modalfooter.$set(modalfooter_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modalheader.$$.fragment, local);
    			transition_in(modalbody.$$.fragment, local);
    			transition_in(modalfooter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modalheader.$$.fragment, local);
    			transition_out(modalbody.$$.fragment, local);
    			transition_out(modalfooter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modalheader, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modalbody, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modalfooter, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(99:0) <Modal isOpen={newAccount} toggle={newAccountToggle}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let p;
    	let t0;
    	let formgroup;
    	let t1;
    	let div;
    	let button;
    	let t3;
    	let modal;
    	let t4;
    	let link;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (navigator.userAgentData.mobile) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type();
    	let if_block = current_block_type(ctx);

    	formgroup = new FormGroup({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	formgroup.$on("sumbit", /*login*/ ctx[5]);

    	modal = new Modal({
    			props: {
    				isOpen: /*newAccount*/ ctx[0],
    				toggle: /*newAccountToggle*/ ctx[4],
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link = new Link({
    			props: {
    				class: "setup",
    				style: { visibility: 'hidden' },
    				to: "setup"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			p = element("p");
    			if_block.c();
    			t0 = space();
    			create_component(formgroup.$$.fragment);
    			t1 = space();
    			div = element("div");
    			button = element("button");
    			button.textContent = "Log in";
    			t3 = space();
    			create_component(modal.$$.fragment);
    			t4 = space();
    			create_component(link.$$.fragment);
    			attr_dev(p, "class", "mt-4 justify-content-center d-flex flex-row svelte-fbffsz");
    			add_location(p, file$2, 73, 0, 2855);
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$2, 96, 4, 3582);
    			attr_dev(div, "class", "justify-content-center d-flex flex-row mb-3");
    			add_location(div, file$2, 95, 0, 3519);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			if_block.m(p, null);
    			insert_dev(target, t0, anchor);
    			mount_component(formgroup, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			insert_dev(target, t3, anchor);
    			mount_component(modal, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(link, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*login*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const formgroup_changes = {};

    			if (dirty & /*$$scope, invalid, password, username*/ 526) {
    				formgroup_changes.$$scope = { dirty, ctx };
    			}

    			formgroup.$set(formgroup_changes);
    			const modal_changes = {};
    			if (dirty & /*newAccount*/ 1) modal_changes.isOpen = /*newAccount*/ ctx[0];

    			if (dirty & /*$$scope*/ 512) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(formgroup.$$.fragment, local);
    			transition_in(modal.$$.fragment, local);
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(formgroup.$$.fragment, local);
    			transition_out(modal.$$.fragment, local);
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if_block.d();
    			if (detaching) detach_dev(t0);
    			destroy_component(formgroup, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t3);
    			destroy_component(modal, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(link, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURL = 'https://hoogeland-pauzes.glitch.me/';

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login', slots, []);
    	let newAccount = false;
    	const newAccountToggle = () => $$invalidate(0, newAccount = !newAccount);
    	let username;
    	let password;
    	let invalid = false;

    	const login = () => {
    		fetch(`${apiURL}getAccount`, {
    			headers: new Headers({ 'content-type': 'application/json' }),
    			mode: 'cors',
    			method: 'POST',
    			body: JSON.stringify({
    				password,
    				username: username.toString(),
    				days: {}
    			})
    		}).then(res => {
    			res.text().then(text => {
    				if (text == 'success') {
    					fetch(`${apiURL}get`, {
    						headers: new Headers({ 'content-type': 'application/json' }),
    						mode: 'cors',
    						method: 'POST',
    						body: JSON.stringify({ password, username: username.toString() })
    					}).then(res => {
    						res.text().then(text => {
    							if (text != 'failed') {
    								localStorage.setItem('username', username);
    								localStorage.setItem('password', password);
    								$$invalidate(3, invalid = false);
    								document.querySelector('.setup').click();
    							} else {
    								$$invalidate(3, invalid = true);
    							}
    						});
    					});
    				} else if (text == 'failed') {
    					$$invalidate(3, invalid = false);
    					newAccountToggle();
    				}
    			});
    		});
    	};

    	const ja = () => {
    		fetch(`${apiURL}createAccount`, {
    			headers: new Headers({ 'content-type': 'application/json' }),
    			mode: 'cors',
    			method: 'POST',
    			body: JSON.stringify({
    				username: username.toString(),
    				password,
    				days: {}
    			})
    		}).then(res => {
    			res.text().then(text => {
    				if (text == 'success') {
    					localStorage.setItem('username', username);
    					localStorage.setItem('password', password);
    					if (username && password) document.querySelector('.setup').click();
    				} else {
    					$$invalidate(3, invalid = true);
    				}
    			});
    		});

    		newAccountToggle();
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input0_value_binding(value) {
    		username = value;
    		$$invalidate(1, username);
    	}

    	function input1_value_binding(value) {
    		password = value;
    		$$invalidate(2, password);
    	}

    	$$self.$capture_state = () => ({
    		Link,
    		Modal,
    		ModalFooter,
    		ModalHeader,
    		ModalBody,
    		FormGroup,
    		Input,
    		newAccount,
    		newAccountToggle,
    		apiURL,
    		username,
    		password,
    		invalid,
    		login,
    		ja
    	});

    	$$self.$inject_state = $$props => {
    		if ('newAccount' in $$props) $$invalidate(0, newAccount = $$props.newAccount);
    		if ('username' in $$props) $$invalidate(1, username = $$props.username);
    		if ('password' in $$props) $$invalidate(2, password = $$props.password);
    		if ('invalid' in $$props) $$invalidate(3, invalid = $$props.invalid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		newAccount,
    		username,
    		password,
    		invalid,
    		newAccountToggle,
    		login,
    		ja,
    		input0_value_binding,
    		input1_value_binding
    	];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Setup.svelte generated by Svelte v3.44.1 */
    const file$1 = "src\\Setup.svelte";

    // (34:4) <Link class="btn btn-secondary" to="/">
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Klaar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(34:4) <Link class=\\\"btn btn-secondary\\\" to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (40:4) <ModalBody>
    function create_default_slot_1$1(ctx) {
    	let t0;
    	let br;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("Als je wilt dat er dagen en vakken tevoorschijn komen, ");
    			br = element("br");
    			t1 = text("\r\n        Moet je de app op je chromebook instaleeren");
    			add_location(br, file$1, 40, 63, 6530);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(40:4) <ModalBody>",
    		ctx
    	});

    	return block;
    }

    // (38:0) <Modal isOpen={warning} toggle={done}>
    function create_default_slot$1(ctx) {
    	let modalbody;
    	let current;

    	modalbody = new ModalBody({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modalbody.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modalbody, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modalbody_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				modalbody_changes.$$scope = { dirty, ctx };
    			}

    			modalbody.$set(modalbody_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modalbody.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modalbody.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modalbody, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(38:0) <Modal isOpen={warning} toggle={done}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div5;
    	let div0;
    	let a;
    	let t0;
    	let t1;
    	let div1;
    	let h60;
    	let t3;
    	let div2;
    	let h61;
    	let t5;
    	let div3;
    	let h62;
    	let t7;
    	let div4;
    	let link0;
    	let t8;
    	let link1;
    	let t9;
    	let modal;
    	let current;

    	link0 = new Link({
    			props: {
    				class: "btn btn-secondary",
    				to: "/",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link({
    			props: {
    				to: "/",
    				class: "home",
    				style: { visibility: "hidden" }
    			},
    			$$inline: true
    		});

    	modal = new Modal({
    			props: {
    				isOpen: /*warning*/ ctx[0],
    				toggle: /*done*/ ctx[1],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			a = element("a");
    			t0 = text("Hoogeland Pauzes");
    			t1 = space();
    			div1 = element("div");
    			h60 = element("h6");
    			h60.textContent = "Sleep deze knop hierboven op je bookmark balk om te instaleeren";
    			t3 = space();
    			div2 = element("div");
    			h61 = element("h6");
    			h61.textContent = "Als je dat gedaan hebt kun je naar magister en kan je klikken op Hoogeland Pauzes,";
    			t5 = space();
    			div3 = element("div");
    			h62 = element("h6");
    			h62.textContent = "Dan kan je de pauzes bekijken en worden ze opgeslagen.";
    			t7 = space();
    			div4 = element("div");
    			create_component(link0.$$.fragment);
    			t8 = space();
    			create_component(link1.$$.fragment);
    			t9 = space();
    			create_component(modal.$$.fragment);
    			attr_dev(a, "href", "javascript:(function()%7Blet%20username%20=%20'" + localStorage.getItem('username') + "';%20let%20password%20=%20'" + localStorage.getItem('password') + "';let%20startInterval%20%3D%20setInterval(()%20%3D%3E%20%7Bif%20(document.querySelector('%23afsprakenLijst%20%3E%20div.k-grid-content%20%3E%20table%20%3E%20tbody%20%3E%20tr')%20%26%26location.host%20%3D%3D%20'isw.magister.net')%20%7BclearInterval(startInterval)%3Bfunction%20getDays()%20%7Blet%20days%20%3D%20%5B%5D%3Blet%20tbody%20%3D%20document.querySelector('%23afsprakenLijst%20%3E%20div.k-grid-content%20%3E%20table%20%3E%20tbody')%3Blet%20trDays%20%3D%20tbody.querySelectorAll('tr.k-grouping-row.ng-scope')%3BtrDays.forEach((day)%20%3D%3E%20%7BdataItem%20%3D%20angular.element(day).scope().dataItem%3BdataItem.elements%20%3D%20%24(day).nextUntil('.k-grouping-row.ng-scope')%3Bdays.push(dataItem)%3B%7D)%3Breturn%20days%3B%7Dfunction%20isSelectedDayToday()%20%7Blet%20date%20%3D%20new%20Date()%3Blet%20currentDate%20%3D''%20%2B%20date.getDate()%20%2B%20date.getMonth()%20%2B%20date.getYear()%3Blet%20date2%20%3D%20new%20Date(getDays()%5B0%5D.value)%3Blet%20anyDate%20%3D''%20%2B%20date2.getDate()%20%2B%20date2.getMonth()%20%2B%20date2.getYear()%3Breturn%20((new%20Date().getDay()%20%3D%3D%200%20%26%26new%20Date(new%20Date().setDate(new%20Date().getDate()%20%2B%201)).getDate()%20%3D%3D%20date2.getDate())%20%7C%7C(new%20Date().getDay()%20%3D%3D%206%20%26%26new%20Date(new%20Date().setDate(new%20Date().getDate()%20%2B%202)).getDate()%20%3D%3D%20date2.getDate())%20%7C%7CcurrentDate%20%3D%3D%3D%20anyDate)%3B%7Dfunction%20parseDays()%20%7Blet%20data%20%3D%20getDays()%3Bdata%20%3D%20data.map((day)%20%3D%3E%20%7Blet%20parsedDay%20%3D%20%7Bsubjects%3A%20day.items%2Cday%3A%20new%20Date(day.value).getTime()%2C%7D%3BparsedDay.subjects%20%3D%20parsedDay.subjects.map((subject)%20%3D%3E%20(%7Bstart%3A%20new%20Date(subject.beginString).getTime()%2Cend%3A%20new%20Date(subject.eindString).getTime()%2Cclasshour%3A%20subject.lesuur%2Ctitle%3Asubject.title.split('-').splice(0%2C%202).join('-')%20%2B'-%20'%20%2Bsubject.locatie%2Clocation%3A%20subject.locatie%2Cdescription%3A%20subject.vak%2Cdocent%3A%20subject.docent%2Chomework%3A%20subject.huiswerk%20!%3D%20null%2Ctoets%3A%20subject.isToets%2C%7D))%3Breturn%20parsedDay%3B%7D)%3Breturn%20data%3B%7Dlet%20selectedDay%3Blet%20startDate%20%3D%20''%3BsetInterval(()%20%3D%3E%20%7Blet%20selected%20%3D%20angular.element(document.querySelector('%23afsprakenlijst-container%20%3E%20aside')).scope()%3F.ctrl%3F.view%3Bif%20(selectedDay%20!%3D%20selected%3F.startDate%20%26%26selected%20%26%26startDate%20!%3D%20getDays()%5B0%5D.value)%20%7Bif%20(isSelectedDayToday())%20%7Blet%20iframe%20%3D%20document.createElement('iframe')%3Biframe.src%20%3D%20'https%3A%2F%2Fhoogeland-pauzes.ml%2FpostIframe.html'%3Biframe.style.visibility%20%3D%20'hidden'%3Biframe.onload%20%3D%20()%20%3D%3E%20%7Biframe.contentWindow.postMessage(%7B%20username%2C%20password%2C%20days%3A%20parseDays()%20%7D%2C'*')%3B%7D%3Bdocument.body.appendChild(iframe)%3B%7DselectedDay%20%3D%20selected.startDate%3Blet%20days%20%3D%20getDays()%3Bdays.forEach((day)%20%3D%3E%20%7Blet%20i%20%3D%200%3Bday.items.forEach((subject)%20%3D%3E%20%7Blet%20lesuur%20%3D%20parseInt(subject.lesuur)%3Blet%20location%20%3D%20parseInt(subject.locatie)%3Blet%20stroom1locatie%20%3Dlocation%20%3D%3D%207%20%7C%7Clocation%20%3D%3D%208%20%7C%7Csubject.vak%20%3D%3D%20'lichamelijke%20opvoeding'%20%7C%7C(location%20%3E%3D%20104%20%26%26%20location%20%3C%3D%20127)%20%7C%7C(location%20%3E%3D%20228%20%26%26%20location%20%3C%3D%20258)%3Blet%20stroom2locatie%20%3D(location%20%3E%3D%2051%20%26%26%20location%20%3C%3D%2088)%20%7C%7C(location%20%3E%3D%20201%20%26%26%20location%20%3C%3D%20227)%20%7C%7C(location%20%3E%3D%20301%20%26%26%20location%20%3C%3D%20330)%3Blet%20stroom1tijd%20%3D%20lesuur%20%3D%3D%204%20%7C%7C%20lesuur%20%3D%3D%208%3Bif%20(stroom1tijd%20%26%26stroom1locatie%20%26%26day.items%5Bday.items.indexOf(subject)%20%2B%201%5D)day.items%5Bday.items.indexOf(subject)%20%2B%201%5D.dontAllowStroom2%20%3D%20true%3Blet%20stroom2tijd%20%3D%20lesuur%20%3D%3D%205%20%7C%7C%20lesuur%20%3D%3D%209%3Blet%20stroom1%20%3D%20stroom1tijd%20%26%26%20stroom1locatie%3Blet%20stroom2%20%3Dstroom2tijd%20%26%26stroom2locatie%20%26%26!subject.dontAllowStroom2%3Blet%20grotePauze1%20%3D%20stroom1locatie%20%26%26%20lesuur%20%3D%3D%206%3Blet%20grotePauze2%20%3Dstroom2locatie%20%26%26lesuur%20%3D%3D%207%20%26%26!subject.dontAllowStroom2%3Bif%20(stroom1%20%7C%7C%20grotePauze1)%20%7Blet%20element%20%3D%20day.elements%5Bi%5D%3Blet%20br%20%3D%20document.createElement('p')%3Bbr.textContent%20%3D%20'pauze'%3B%2F%2F%20br.style.height%20%3D%20'25px'%3B%2F%2F%20br.style.textAlign%20%3D%20'center'%3B%2F%2F%20br.style.borderTop%20%3D%20'1px%20solid%20rgb(204%2C%20204%2C%20204)'%3B%24(element).before(br)%3B%7Dif%20(stroom2%20%7C%7C%20grotePauze2)%20%7Blet%20element%20%3D%20day.elements%5Bi%5D%3Blet%20br%20%3D%20document.createElement('p')%3Bbr.textContent%20%3D%20'pauze'%3B%24(element).before(br)%3B%7Di%2B%2B%3B%7D)%3B%7D)%3BstartDate%20%3D%20getDays()%5B0%5D.value%3B%7D%20else%20if%20(!selected)%20selectedDay%20%3D%20null%3B%7D%2C%20100)%3B%7D%7D%2C%20100)%7D)()");
    			attr_dev(a, "class", "btn btn-secondary");
    			add_location(a, file$1, 14, 4, 500);
    			attr_dev(div0, "class", "mt-3 d-flex justify-content-center");
    			add_location(div0, file$1, 12, 0, 395);
    			add_location(h60, file$1, 20, 4, 5832);
    			attr_dev(div1, "class", "mt-3 d-flex justify-content-center");
    			add_location(div1, file$1, 19, 0, 5778);
    			add_location(h61, file$1, 23, 4, 5968);
    			attr_dev(div2, "class", "mt-3 d-flex justify-content-center");
    			add_location(div2, file$1, 22, 0, 5914);
    			add_location(h62, file$1, 28, 4, 6134);
    			attr_dev(div3, "class", "d-flex justify-content-center");
    			add_location(div3, file$1, 27, 0, 6085);
    			attr_dev(div4, "class", "mt-3 d-flex justify-content-center");
    			add_location(div4, file$1, 32, 0, 6223);
    			div5.hidden = navigator.userAgentData.mobile;
    			add_location(div5, file$1, 11, 0, 348);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div0, a);
    			append_dev(a, t0);
    			append_dev(div5, t1);
    			append_dev(div5, div1);
    			append_dev(div1, h60);
    			append_dev(div5, t3);
    			append_dev(div5, div2);
    			append_dev(div2, h61);
    			append_dev(div5, t5);
    			append_dev(div5, div3);
    			append_dev(div3, h62);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			mount_component(link0, div4, null);
    			insert_dev(target, t8, anchor);
    			mount_component(link1, target, anchor);
    			insert_dev(target, t9, anchor);
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const modal_changes = {};
    			if (dirty & /*warning*/ 1) modal_changes.isOpen = /*warning*/ ctx[0];

    			if (dirty & /*$$scope*/ 4) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(link0);
    			if (detaching) detach_dev(t8);
    			destroy_component(link1, detaching);
    			if (detaching) detach_dev(t9);
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Setup', slots, []);
    	let warning = navigator.userAgentData.mobile;

    	const done = () => {
    		if ($$invalidate(0, warning = true)) {
    			$$invalidate(0, warning = false);
    			document.querySelector('.home').click();
    		} else $$invalidate(0, warning = true);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Setup> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Modal, ModalBody, Link, warning, done });

    	$$self.$inject_state = $$props => {
    		if ('warning' in $$props) $$invalidate(0, warning = $$props.warning);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [warning, done];
    }

    class Setup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Setup",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.1 */
    const file = "src\\App.svelte";

    // (13:4) <Route path="/">
    function create_default_slot_2(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(13:4) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:4) <Route path="/index.html">
    function create_default_slot_1(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(16:4) <Route path=\\\"/index.html\\\">",
    		ctx
    	});

    	return block;
    }

    // (12:0) <Router>
    function create_default_slot(ctx) {
    	let route0;
    	let t;
    	let route1;
    	let current;

    	route0 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/index.html",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t = space();
    			create_component(route1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(route1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(route1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(12:0) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let router;
    	let t;
    	let link;
    	let current;

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    			t = space();
    			link = element("link");
    			attr_dev(link, "rel", "apple-touch-icon");
    			attr_dev(link, "href", "icons/512-512.png");
    			add_location(link, file, 25, 0, 602);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, link, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	onMount(() => {
    		document.querySelector('body').style.visibility = 'visible';
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		Home,
    		Login,
    		Setup,
    		Router,
    		Route
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    if ('serviceWorker' in navigator) {
    	navigator.serviceWorker.register('/sw.js');
    }

    return app;

})();
//# sourceMappingURL=bundle.js.map
