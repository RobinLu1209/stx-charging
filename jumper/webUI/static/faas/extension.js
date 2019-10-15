// extension for markdown content

function execute_javascript(tid, btn) {
	var code = _mdGetCode(tid);
	(function () {
		// prepare console.log
		var
			buffer = '',
			_log = function (s) {
				buffer = buffer + s + '\n';
			},
			_warn = function (s) {
				console.warn(s);
				buffer = buffer + s + '\n';
			},
			_error = function (s) {
				console.error(s);
				buffer = buffer + s + '\n';
			},
			_console = {
				trace: _log,
				debug: _log,
				log: _log,
				info: _log,
				warn: _warn,
				error: _error
			};
		try {
			eval('(function() {\n var console = _console; \n' + code + '\n})();');
			if (!buffer) {
				buffer = '(no output)';
			}
			_mdShowCodeResult(btn, buffer);
		}
		catch (e) {
			buffer = buffer + String(e);
			_mdShowCodeError(btn, buffer);
		}
	})();
}

// init markdown table:
function initMarkdownTables() {
	$('#x-content table').each(function () {
		var $t = $(this);
		if (!$t.hasClass('uk-table')) {
			$t.find('[align=left]').css('text-align', 'left');
			$t.find('[align=right]').css('text-align', 'right');
			$t.find('[align=center]').css('text-align', 'center');
			$t.addClass('uk-table');
		}
	});
}

function _mdGetCode(tid) {
	var
		$pre = $('#pre-' + tid),
		$post = $('#post-' + tid),
		$textarea = $('#textarea-' + tid);
    return $textarea.val();
//	return $pre.text() + $textarea.val() + '\n' + ($post.length === 0 ? '' : $post.text());
}

function _mdSetCodeResult(btn, result, isHtml, isError) {
	var $r = $(btn).next('div.x-code-result');
	if ($r.get(0) === undefined) {
		$(btn).after('<div class="x-code-result x-code uk-alert"></div>');
		$r = $(btn).next('div.x-code-result');
	}
	$r.removeClass('uk-alert-danger');
	if (isError) {
		$r.addClass('uk-alert-danger');
	}
	if (isHtml) {
		$r.html(result);
	} else {
		var ss = result.split('\n');
		var htm = _.map(ss, function (s) {
			return encodeHtml(s).replace(/ /g, '&nbsp;');
		}).join('<br>');
		$r.html(htm);
	}
}

function _mdShowCodeResult(btn, result, isHtml) {
	_mdSetCodeResult(btn, result, isHtml);
}

function _mdShowCodeError(btn, result, isHtml) {
	_mdSetCodeResult(btn, result, isHtml, true);
}

function _mdAdjustTextareaHeight(t) {
	var
		$t = $(t),
		lines = $t.val().split('\n').length;
	if (lines < 9) {
		lines = 9;
	}
	$t.attr('rows', '' + (lines + 1));
}

var initRunCode = (function() {
	var tid = 0;
	var trimCode = function (code) {
		var ch;
		while (code.length > 0) {
			ch = code[0];
			if (ch === '\n' || ch === '\r') {
				code = code.substring(1);
			}
			else {
				break;
			}
		}
		while (code.length > 0) {
			ch = code[code.length - 1];
			if (ch === '\n' || ch === '\r') {
				code = code.substring(0, code.length - 1);
			}
			else {
				break;
			}
		}
		return code + '\n';
	};
	var fnInitPre = function ($pre, fn_run) {
		tid++;
		var
			theId = 'online-run-code-' + tid,
			$code = $pre.children('code'),
			$post = null,
			codes = $code.text().split('----', 3);
		$code.remove();
		$pre.attr('id', 'pre-' + theId);
		$pre.css('font-size', '14px');
		$pre.css('margin-bottom', '0');
		$pre.css('border-bottom', 'none');
		$pre.css('padding', '6px');
		$pre.css('border-bottom-left-radius', '0');
		$pre.css('border-bottom-right-radius', '0');
		$pre.wrap('<form class="uk-form uk-form-stack uk-margin-top uk-margin-bottom" action="#0"></form>');
		$pre.after('<button type="button" onclick="' + fn_run + '(\'' + theId + '\', this)" class="uk-button uk-button-primary" style="margin-top:15px;"><i class="uk-icon-play"></i> Run</button>');
		if (codes.length === 1) {
			codes.unshift('');
			codes.push('');
		} else if (codes.length === 2) {
			codes.push('');
		}
		$pre.text(trimCode(codes[0]))
		if (codes[2].trim()) {
			// add post:
			$pre.after('<pre id="post-' + theId + '" style="font-size: 14px; margin-top: 0; border-top: 0; padding: 6px; border-top-left-radius: 0; border-top-right-radius: 0;"></pre>');
			$post = $('#post-' + theId);
			$post.text(trimCode(codes[2]));
		}
		$pre.after('<textarea id="textarea-' + theId + '" onkeyup="_mdAdjustTextareaHeight(this)" class="uk-width-1-1 x-codearea" rows="10" style="overflow: scroll; border-top-left-radius: 0; border-top-right-radius: 0;' + ($post === null ? '' : 'border-bottom-left-radius: 0; border-bottom-right-radius: 0;') + '"></textarea>');
		$('#textarea-' + theId).val(trimCode(codes[1]));
		_mdAdjustTextareaHeight($('#textarea-' + theId).get(0));
	};
	return fnInitPre;
})();

function _mdCheckChoice(formId) {
	var
		$form = $('#' + formId),
		$yes = $form.find('span.uk-text-success'),
		$no = $form.find('span.uk-text-danger'),
		$checkboxes = $form.find('input[type=checkbox]');
	$yes.show();
	$no.hide();
	$checkboxes.each(function (i, c) {
		var
			$c = $(c),
			shouldCheck = $c.attr('x-data') === 'x',
			isCheck = $c.is(':checked');
		if (shouldCheck !== isCheck) {
			$yes.hide();
			$no.show();
		}
	});
}

var _theChoiceId = 0;

function _initChoice($pre) {
	_theChoiceId++;
	var
		i, x, c,
		id = 'form-choice-' + _theChoiceId,
		codes = $pre.children('code').text().split('----', 2),
		question = codes[0],
		choices = $.trim(codes[1]).split('\n');
	var h = '<form id="' + id + '" class="uk-form uk-margin-top uk-margin-bottom"><fieldset><legend><i class="uk-icon-question-circle"></i> ' + encodeHtml(question) + '</legend>';
	for (i = 0; i < choices.length; i++) {
		c = $.trim(choices[i]);
		x = c.indexOf('[x]') === 0 || c.indexOf('(x)') === 0;
		if (x) {
			c = c.substring(3);
		}
		h = h + '<div class="uk-form-row"><label><input type="checkbox" ' + (x ? 'x-data="x"' : '') + '> ' + encodeHtml(c) + '</label></div>';
	}
	h = h + '<div class="uk-form-row"><button type="button" class="uk-button uk-button-primary" onclick="_mdCheckChoice(\'' + id + '\')">Submit</button>&nbsp;&nbsp;&nbsp;';
	h = h + '<span class="uk-text-large uk-text-success" style="display:none"><i class="uk-icon-check"></i></span>';
	h = h + '<span class="uk-text-large uk-text-danger" style="display:none"><i class="uk-icon-times"></i></span></div></fieldset></form>';
	$pre.replaceWith(h);
}

function initMarkdownChoice() {
	$('pre>code.language-choice').each(function () {
		_initChoice($(this).parent());
	});
}

function initMarkdownRun() {
	$('pre>code').each(function (i, code) {
		var
			$code = $(code),
			classes = ($code.attr('class') || '').split(' '),
			nohightlight = (_.find(classes, function (s) { return s.indexOf('language-nohightlight') >= 0; }) || '').trim(),
			x_run = (_.find(classes, function (s) { return s.indexOf('language-x-') >= 0; }) || '').trim();
		console.log("init " + $code);
		if ($code.hasClass('language-ascii')) {
			// set ascii style for markdown:
			$code.css('font-family', '"Courier New",Consolas,monospace')
				.parent('pre')
				.css('font-size', '12px')
				.css('line-height', '12px')
				.css('border', 'none')
				.css('white-space', 'pre')
				.css('background-color', 'transparent');
		} else if (x_run) {
			var fn = 'execute_' + x_run.substring('language-x-'.length);
			initRunCode($code.parent(), fn);
		} else if (!nohightlight) {
			hljs.highlightBlock(code);
		}
	});
}

function initMarkdownInfo() {
	$('pre>code').each(function () {
		var
			$code = $(this),
			classes = ($code.attr('class') || '').split(' '),
			warn = (_.find(classes, function (s) { return s.indexOf('language-!') >= 0; }) || '').trim(),
			info = (_.find(classes, function (s) { return s.indexOf('language-?') >= 0; }) || '').trim();
		if (warn || info) {
			$code.parent().replaceWith('<div class="uk-alert ' + (warn ? 'uk-alert-danger' : '') + '"><i class="uk-icon-' + (warn ? 'warning' : 'info-circle') + '"></i> ' + encodeHtml($code.text()) + '</div>');
		}
	});
}

function initMarkdownMath() {
	var fnRenderMath = function (text) {
		try {
			return katex.renderToString(text);
		} catch (e) {
			return {
				error: e.message + '\n' + text
			};
		}
	};
	$('pre>code.language-math').each(function () {
		var
			$code = $(this),
			math = fnRenderMath($code.text().trim());
		if (math.error) {
			$code.text(math.error);
		} else {
			$code.parent().replaceWith('<p>' + math + '</p>');
		}
	});
	$('p>code').each(function () {
		var
			math,
			$code = $(this),
			prevNode = this.previousSibling,
			nextNode = this.nextSibling,
			prevText = prevNode && prevNode.nodeValue,
			nextText = nextNode && nextNode.nodeValue;
		if (typeof(prevText)=== 'string' && typeof(nextText)==='string') {
			if (prevText.substring(prevText.length-1, prevText.length) === '$' && nextText.substring(0, 1) === '$') {
				math = fnRenderMath($code.text());
				if (math.error) {
					$code.text(math.error);
				} else {
					prevNode.nodeValue = prevText.substring(0, prevText.length - 1);
					nextNode.nodeValue = nextText.substring(1);
					$code.replaceWith(math);
				}
			}
		}
	});
}

$(function () {
	var fnTry = function (fn) {
		try {
			fn();
		} catch (err) {
			console.log(err);
		}
	};
	fnTry(initMarkdownTables);
	fnTry(initMarkdownInfo);
	fnTry(initMarkdownRun);
	fnTry(initMarkdownChoice);
	fnTry(initMarkdownMath);
});
