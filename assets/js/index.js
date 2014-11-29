/**
 * Main JS file for Casper behaviours
 */

/* globals jQuery, document */
(function ($, sr, undefined)
{
	"use strict";

	var $document = $(document),

        // debouncing function from John Hann
        // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
        debounce = function (func, threshold, execAsap)
        {
        	var timeout;

        	return function debounced()
        	{
        		var obj = this, args = arguments;
        		function delayed()
        		{
        			if (!execAsap)
        			{
        				func.apply(obj, args);
        			}
        			timeout = null;
        		}

        		if (timeout)
        		{
        			clearTimeout(timeout);
        		} else if (execAsap)
        		{
        			func.apply(obj, args);
        		}

        		timeout = setTimeout(delayed, threshold || 100);
        	};
        };

	$document.ready(function ()
	{

		var $postContent = $(".post-content");
		$postContent.fitVids();

		function updateImageWidth()
		{
			var $this = $(this),
                contentWidth = $postContent.outerWidth(), // Width of the content
                imageWidth = this.naturalWidth; // Original image resolution

			if (imageWidth >= contentWidth)
			{
				$this.addClass('full-img');
			} else
			{
				$this.removeClass('full-img');
			}
		}

		var $img = $("img").on('load', updateImageWidth);
		function casperFullImg()
		{
			$img.each(updateImageWidth);
		}

		casperFullImg();
		$(window).smartresize(casperFullImg);

		$(".scroll-down").arctic_scroll();

		// Load Ace editor asynchronously and call the onload callback
		$('script[data-src]').each(function (i,el)
		{
			var $el = $(el),
				loadMethod = $el.data('onload');
			if (loadMethod || typeof window[loadMethod] === 'function')
			{
				el.onload = window[loadMethod];
			}

			el.src = $el.data('src');
		});

		headerLinks();
	});

	// smartresize
	jQuery.fn[sr] = function (fn) { return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

	// Arctic Scroll by Paul Adam Davis
	// https://github.com/PaulAdamDavis/Arctic-Scroll
	$.fn.arctic_scroll = function (options)
	{

		var defaults = {
			elem: $(this),
			speed: 500
		},

        allOptions = $.extend(defaults, options);

		allOptions.elem.click(function (event)
		{
			event.preventDefault();
			var $this = $(this),
                $htmlBody = $('html, body'),
                offset = ($this.attr('data-offset')) ? $this.attr('data-offset') : false,
                position = ($this.attr('data-position')) ? $this.attr('data-position') : false,
                toMove;

			if (offset)
			{
				toMove = parseInt(offset);
				$htmlBody.stop(true, false).animate({ scrollTop: ($(this.hash).offset().top + toMove) }, allOptions.speed);
			} else if (position)
			{
				toMove = parseInt(position);
				$htmlBody.stop(true, false).animate({ scrollTop: toMove }, allOptions.speed);
			} else
			{
				$htmlBody.stop(true, false).animate({ scrollTop: ($(this.hash).offset().top) }, allOptions.speed);
			}
		});

	};
})(jQuery, 'smartresize');

function headerLinks()
{
	var $currentActiveHeader = $.fn;

	function setActiveHeader($el)
	{
		$currentActiveHeader.removeClass('active');
		$currentActiveHeader = $el;
		$currentActiveHeader.addClass('active');
	}

	// Make the headers on posts linkable
	$('.post-content h1,.post-content h2,.post-content h3,.post-content h4,.post-content h5,.post-content h6').each(function (i, el)
	{
		var anchor = document.createElement('A'),
			$el = $(el);

		anchor.href = '#' + el.id;
		anchor.className = 'header-link octicon octicon-link';

		$el.addClass('linkable-header');

		if (location.hash.substr(1) === el.id)
		{
			setActiveHeader($el);
		}

		$el.append(anchor);
	});

	$(window).on('hashchange', function ()
	{
		setActiveHeader($(window.location.hash));
	});
}

function aceOnload()
{
	$('pre code').each(function (i, el)
	{
		var newEl = document.createElement('CODE');
		newEl.className = el.className + (el.className ? ' ' : '') + 'ace-editor';
		newEl.innerHTML = el.innerHTML;
		// the three-backticks syntax for code blocks in markdown allows you to specify the language name, which Ghost gets set as a class on the code element.
		newEl.setAttribute('data-language', (el.className.match(/language-([^ ]+)/) || [, 'c_cpp'])[1]);
		
		var editor = ace.edit(newEl);
		
		editor.setOptions(
		{
			minLines: 1,
			maxLines: 20
		});
		
		// el.dataset only works in IE11. :(
		// c_cpp is a safe bet for most languages I work with.
		editor.session.setMode('ace/mode/' + newEl.getAttribute('data-language'));
		
		// Who needs <pre> when you have Ace? Replace the pre element with the newEl <code> element.
		$(el.parentElement).replaceWith(editor.container);
	});
};