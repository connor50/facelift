const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const n = (template) => document.createRange().createContextualFragment(template);

const rm = (child) => child.parentNode.removeChild(child);
const $body = document.body;

// remove items
const $left = $('#leftCol');
rm($left);

const $right = $('#rightCol');
rm($right);

const $profilebtns = $('#u_0_2').firstElementChild;
rm($profilebtns);

// set zoom for webpage
document.body.style.zoom = 1.2;


const ads = $$('._4ikz');
ads.filter(x => x.textContent.match('Suggested Post'))
.map(rm);

const $content = $('#contentArea');
const $topbar = $('#pagelet_bluebar');


$body.innerHTML = '';

$body.appendChild($topbar)
$body.appendChild($content)
