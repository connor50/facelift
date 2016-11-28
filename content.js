const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const n = (template) => document.createRange().createContextualFragment(template);

const $body = document.body;

// Extract content from loaded article
const $intro = $('#content .full_intro');
const $story = $('#content .fullstory');
const $recent = $('#content .advanced-recent-posts');

// Clear initial body content
$body.innerHTML = '';

// Filter out useless p tags from full story
[...$story.querySelectorAll('p')]
  .filter(x => x.innerHTML == '&nbsp;' || x.innerHTML == '')
  .forEach(x => x.parentNode.removeChild(x));

// Put title and date after article image
$story.firstElementChild.after(n($intro.innerHTML));

// Compile new article content
const $article = n(`
  <header>
    <a href='/'>
      <img src="http://www.thedailymash.co.uk/images/logo_wide_nonews.jpg" alt="" />
    </a>
  </header>
  <article>${$story.innerHTML}</article>
  <related->${$recent.innerHTML}</related->
`);

// Append new content to body
$body.appendChild($article);
$body.classList.add('mashed');
