# thedailymashup

A chrome extension built to demonstrate the potential of an unsolicited, minimalist redesign of both the interface and user experience on the domain http://www.thedailymash.co.uk, namely article pages.

```
DISCLAIMER: I love the daily mash, their writers and their content. My intention here is not to hinder their service nor discredit them in any way. All changes you see implemented here are motivated entirely by personal preference.
```

## Motivation

I recently moved to the united states of america (great timing you say) for work. Somewhat a ritual for me, is strong dose of satire with my coffee in the morning. The website thedailymash.co.uk helps me get my fix for the day.

Unknowingly to me until recently, fans of the daily mash who do not reside in the UK are subject to..

| free access to seven of our articles each 30 days

After which one is presented with an ultimatum. Pay £2.49 a month to lower the paywall or build a chrome extension to remove the semi transparent paywall overlay element that gets position fixed over the article you are trying to read. For me this was a no brainer. It is not that I am against paying for a good service.. but I needed a new project and was curious as to what kind of a reader experience I could craft for myself just using the chrome inspector (adding/removing/editing mostly html and css).


## Implementation

Once I started digging into the site with inspector it became clear that there were some quick wins to be made in terms of performance and aesthetics.

![thedailymash article](https://s3-eu-west-1.amazonaws.com/lukejacksonn/Screen+Shot+2016-11-26+at+8.40.09+AM.png)

Upon initial hard refresh of a typical article page, 303 network requests were induced, which resulted in 2.9mb of downloaded data. DOM content loads in 3.83s and the page finished loading (and overlays the paywall at 11.75s). The console churns out copious logs, 20 of which are javascript errors. It was hard to believe that all this was required to serve up what is essentially plain text article limited to 350 words and a single image.

It turns out, a LOT of that is not needed to deliver a more streamlined user experience. What follows are the steps I took to try remove all possible noise from around the page, in vein of more efficiently delivering the most important content to the user.

### 1. Prototype UI

The first thing I usually do when redesigning something, is start with an empty codepen and draft out what kind of a layout am I aiming for, given no constraints. After about half an hour I ended up with something as basic as this..

https://codepen.io/lukejacksonn/pen/XNaVMY

The main points of focus being the website logo, the full story article, some links to other relevant/related/recent content and a simple footer. Nothing ground breaking. Just the bare essentials but it gave me and end goal to aim toward.

### 2. Abstract Content

Looking at the screen capture timeline in chrome inspector I could tell that most of the primary content on an article page was being rendered in the first two seconds, which was great! The rest of the content (advertisements and sponsored links) were being dynamically added to the page with javascript. More on this later.. what I was focussed on was the main article content.

```javascript
  // Helper function
  const $ = (selector) => document.querySelector(selector);

  // Extract important content
  const $intro = $('#content .full_intro');
  const $story = $('#content .fullstory');
  const $recent = $('#content .advanced-recent-posts');
```

Everything I needed was wrapped up in an element with an id of `#content`. Namely there was the article title and date published in `.full_intro` and the actual body copy was in `.fullstory`. As a bonus there turned out to also be a very concise list of recent articles at the bottom of the content container, named `.advanced-recent-posts`. Luckily doesn't take much to extract this kind of uniform data from the page. Some basic formatting needed to take place in order to reach the layout outlined in the simplified ui.

```javascript
// Clear initial body contents
$body.innerHTML = '';

// Filter out useless p tags from full story
[...$story.querySelectorAll('p')]
  .filter(x => x.innerHTML == '&nbsp;' || x.innerHTML == '')
  .forEach(x => x.parentNode.removeChild(x));

// Put title and date after article image
$story.firstElementChild.after(n($intro.innerHTML));
```

At this point I pretty much had all the content I needed to replicate my mockup for reals. All I needed to do was template it up and append it to the page and inject the styles I used in the codepen.

```javascript
// Compile new article content
const $article = n(`
  <header>
    <a href='/'>
      <img src=".../images/logo.jpg" />
    </a>
  </header>
  <article>${$story.innerHTML}</article>
  <related->${$recent.innerHTML}</related->
`);

// Append new content to body
$body.appendChild($article);
```

### 3. Automate Execution

Until this point this while experiment was being conducted manually in the chrome inspector. it was proof of concept work but now I could see it working, it was getting serious. Time to automate _all_ the things.

```
{
  "name": "thedailymashup",
  "description": "Enjoy your favorite satirical news articles with a minimalist style.",
  "version": "1.0",
  "permissions": [
    "tabs", "*://www.thedailymash.co.uk/*"
  ],
  "content_scripts": [{
    "matches": ["*://www.thedailymash.co.uk/news/*/*"],
    "js": ["content.js"],
    "css": ["content.css"],
    "run_at": "document_end"
  }]
}
```

Almost anything you can do in the inspector, you can do in a chrome extension. Using `content_scripts` you can inject `js` and `css` into a page on page load (using `run_at` with values `document_start` or `document_end`) and thus automate your intentions.

### 4. Noise Reduction

Now my injected script and style were being executed every time I visited a url of the form `*://www.thedailymash.co.uk/news/*/*`. Great success! Not quite.. yet. The primary content was indeed being abstracted from the original document, the original document body was being wiped and our new neatly formatted template was being rendered in place. Looking under the hood though.. things were still slightly convoluted.

It turned out that because the extension was told to execute code on `document_end` then much of the superfluous dynamically generated content in the original is being requested before we get the chance to kill it. Seeing as I had all the content I needed, I wanted to prevent all other resources from being requested so that we could get on with executing the contents scripts asap.

#### Clear the head!?

Most of the clutter was being requested by `script` tags in the document head. So in a brute force fashion I tried `document.head.innerHTML = ''`.. this did not have the intended effect. Although it tidied up the head, and even reduced the request waterfall somewhat. Some request would undoubtedly get executed before the body content had loaded. Next.

#### Disable javascript!?

As mentioned prior, most of the observable ruckus stems from dirty `script` tags, mostly ad related. So in a flash of anarchy, I disabled all javascript to see what would happen. To my amazement, everything still worked. It turns out that the site supports `noscript` really well (which got me wishing I had tried this earlier). It reduces the request count down to 62, payload down to ~300kb and load time to ~660ms.

There was only one qualm with this solution.. could I automate it. Last time I checked the docs it wasn't possible. Luckily we live in the future and this is now very easy to implement within a `background` script.

```javascript
// Disable javascript for all pages on domain
chrome.contentSettings.javascript.set({
  primaryPattern: '*://www.thedailymash.co.uk/*',
  setting: 'block'
});
```

## Product

![thedailymashup chrome extension](https://s3-eu-west-1.amazonaws.com/lukejacksonn/Screen+Shot+2016-11-28+at+3.37.13+AM.png)

For a weekends work, I feel the resultant product of the above process, nicely satisfies what we set out to achieve; maximize performance and user experience of reading an article on thedailymash.co.uk.

If you would like to try it out then you can download the extension HERE or clone this project and run it as an unpacked extension.

Key takeaways include:

- Eliminated the paywall altogether
- Featured only the most important content
- Created a simple responsive article template
- Some retention of related content
- HTTP request count down from 300+ to 27
- Payload down from 3mb to 195KB
- Load time down from 11s to 500ms

Personally I am certainly going to continue using this extension to browse the daily mash articles. I would love the opportunity sit down with the owners of the daily mash and further elaborate on my findings or talk about the potential benefits of implementing some of the techniques I have used in a more permanent fashion so that they can keep delivering such amazing content. Until then, if anyone has any issues, or feature requests I'd love to hear them!
