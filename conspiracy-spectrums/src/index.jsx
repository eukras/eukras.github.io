/**
 * A simple conspiracy spectrum tool. Allows easy sharing of a person's degree of confidence in a range of related statements.
 *
 * Based on Mick West, 'Escaping the Rabbit Hole' (2018), ch.2.
 *
 * PAGE 1: Select a spectrum.
 *  - / (or anything not matching...)
 *
 * PAGE 2: Select confidence in each statement. Sort table dynamically. Move divider to show where sensibility begins.
 *  - ?covid_19
 *
 * PAGE 3: Display a shareable results link.
 *  - #SUQ9Y292aWRfMTkmdHk9OSZjcz0xM... (etc)
 *
 * Data structures: 
 *  - CONFIDENCE values are 0..10
 *  - The RATINGS data structure is a dictionary of [key, confidence],
 *    e.g. {'tt': 4, ...}
 *
 * @package Conspiracy Spectrums
 * @author Nigel Chapman <nigel@chapman.id.au>
 */
import { useAutoAnimate } from '@formkit/auto-animate/preact';
import { signal } from '@preact/signals';
import { render } from 'preact';

import { filterBetween, getAverageConfidence, sortRatings } from './ratings';
import { SPECTRUMS } from './spectrums';
import { readUrl, writeUrl } from './uri';

import './style.css';

const [spectrum, ratingsObj, locked] = readUrl(SPECTRUMS);

const ratings = signal(ratingsObj);
const initial = sortRatings(spectrum, ratings.value);
const display = signal(initial);


export function App() {
  if (!spectrum) {
    return <SelectSpectrum />
  } else {
    if (locked === false) {
      return <EnterRatings />
    } else {
      return <ShareRatings />
    }
  }
}

function setRating(id, confidence) {
  ratings.value = {
    ...ratings.value,
    [id]: parseInt(confidence),
  };
  display.value = sortRatings(spectrum, ratings.value);
}

function SelectSpectrum(props) {
  return <div>
    <Header />
    <main>
      <div class="button-list">
        {Object.entries(SPECTRUMS).map(([id, spectrum]) => {
          return <a href={"?" + id}>{spectrum['name']}{spectrum['detailed'] ? ' *' : ''}</a>
        })}
      </div>
      <p><small>* Spectrums with an asterisk assume a detailed knowledge of their topic.</small></p>
      <ExplainSpectrums />
    </main>
    <Footer />
  </div>
}

function EnterRatings(props) {
  return <div class="enter-ratings" >
    <Header />
    <main>
      {spectrum['detailed'] &&
        <div class="space-above-2em">
          <p class="highlight"><b>Note.</b> This spectrum assumes a detailed knowledge of its topic.</p>
        </div>
      }
      <h2>{spectrum['name']}</h2>
      <p>Use the sliders to rank the following {display.value.length} statements from zero to ten.</p>
      <div class="space-2em flex-center">
        <RatingsLegend />
      </div>
      <div class="margin-auto">
        <RatingTable locked={false} />
      </div>
      <div class="space-3em flex-center">
        <RatingsSummary />
      </div>
      <div class="button-list">
        <a href={writeUrl(spectrum, ratings.value)} target="_blank">Share your answers</a>
        <a href={'/'}>See other spectrums</a>
      </div>

      <h2>Why share?</h2>
      <p>Conspiracy theories can be especially hard to discuss if we only rely
        on assumptions about what we each believe. Making and sharing
        conspiracy spectrums can save us guessing, and can lead to better
        conversations. Use the button above to share your conspiracy spectrum
        with friends and family, or online, and discuss why you think
        differently at various points.</p>
      <div class="button-list">
        <a target="_blank" href="https://twitter.com/hashtag/ConspiracySpectrums">#Conspiracy&shy;Spectrums</a>
        <a href="/">More information?</a>
      </div>

      <h2>About this spectrum</h2>
      <p>{spectrum['description']}</p>
      {
        spectrum['button_text'] && spectrum['button_href'] &&
        <div class="button-list">
          <a target="_blank" href={spectrum['button_href']}>{spectrum['button_text']}</a>
        </div>
      }
    </main >
    <Footer />
  </div >
}

function ShareRatings(props) {
  return <div class="enter-ratings" >
    <Header />
    <main>
      <RatingsSummary />
      <h2>About this link</h2>
      <p class="highlight">
        This is a shareable link to another person's conspiracy spectrum.
      </p>
      <p>They were asked to say how confident they were about the {display.value.length} statements below, on a scale of zero to ten.</p>
      <RatingsLegend />
      <p>You may have some questions about <i>why</i> they believe one thing or don't believe another. Ask them. That's the whole idea of conspiracy spectrums.</p>
      <div class="space">
        <RatingTable locked={true} />
      </div>
      <h2>Do it yourself</h2>
      <p>You can fill in this conspiracy spectrum yourself and share your
        own answers with others.</p>
      <div class="button-list">
        <a href={'?' + spectrum.id} target="_blank">Do it yourself</a>
        <a href={'/'} class="button button-secondary">See other spectrums</a>
      </div>
      <h2>About this spectrum</h2>
      <p>{spectrum['description']}</p>
    </main>
    <Footer />
  </div>
}

function RatingsLegend(props) {
  return <>
    <table class="hide-mobile">
      <tr><th>0</th><th>1 – 4</th><th>5</th><th>6 – 9</th><th>10</th></tr>
      <tr><td>Certainly false</td><td>More likely false</td><td>No opinion either way</td><td>More likely true</td><td>Certainly true</td></tr>
    </table>
    <table class="show-mobile">
      <tr>
        <th>0</th>
        <td>Certainly false</td>
      </tr>
      <tr>
        <th>1 – 4</th>
        <td>More likely false</td>
      </tr>
      <tr>
        <th>5</th>
        <td>No opinion either way</td>
      </tr>
      <tr>
        <th>6 – 9</th>
        <td>More likely true</td>
      </tr>
      <tr>
        <th>10</th>
        <td>Certainly true</td>
      </tr>
    </table>
  </>
}

function RatingsSummary(props) {

  const impossible = filterBetween(display.value, 0, 0)
  const silly = filterBetween(display.value, 1, 4)
  const unsure = filterBetween(display.value, 5, 5);
  const sensible = filterBetween(display.value, 6, 9)
  const certain = filterBetween(display.value, 10, 10)
  const impossibleScore = Math.round(impossible.length / display.value.length * 100);
  const sillyScore = Math.round(silly.length / display.value.length * 100);
  const unsureScore = Math.round(unsure.length / display.value.length * 100);
  const sensibleScore = Math.round(sensible.length / display.value.length * 100);
  const certainScore = Math.round(certain.length / display.value.length * 100);
  const average = getAverageConfidence(display.value);
  return <>
    <div class="rounded-box">
      <div class="space">
        <div class="text-large"><b>{spectrum.name}</b></div>
        <div>Conspiracy Spectrum</div>
      </div>
      <div class="space-2em flex-center">
        <table class="hide-mobile">
          <tr>
            <th>{impossibleScore}<span class="percent">%</span></th>
            <th>{sillyScore}<span class="percent">%</span></th>
            <th>{unsureScore}<span class="percent">%</span></th>
            <th>{sensibleScore}<span class="percent">%</span></th>
            <th>{certainScore}<span class="percent">%</span></th>
          </tr>
          <tr>
            <td>Certainly false</td>
            <td>More likely false</td>
            <td>No opinion either way</td>
            <td>More likely true</td>
            <td>Certainly true</td>
          </tr>
        </table>
        <table class="show-mobile">
          <tr>
            <th>{impossibleScore}<span class="percent">%</span></th>
            <td>Certainly false</td>
          </tr>
          <tr>
            <th>{sillyScore}<span class="percent">%</span></th>
            <td>More likely false</td>
          </tr>
          <tr>
            <th>{unsureScore}<span class="percent">%</span></th>
            <td>No opinion either way</td>
          </tr>
          <tr>
            <th>{sensibleScore}<span class="percent">%</span></th>
            <td>More likely true</td>
          </tr>
          <tr>
            <th>{certainScore}<span class="percent">%</span></th>
            <td>Certainly true</td>
          </tr>
        </table>
      </div>
      <div class="space">
        <div>Average confidence: <b>{average}</b> / 10</div>
        <div><small>https://eukras.github.io</small></div>
      </div>
    </div>
  </>
}

function RatingTable(props) {
  return <div class="ratings-table">
    <RatingRows locked={props.locked} />
  </div>
}

function RatingHeader(props) {
  return <>
    <div class="rating-row rating-header">
      {false &&
        <div class="rating-slider">
          <div class="rating-legend space-between">
            {[' 0', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((key) => {
              return <small>{key}</small>
            })}
          </div>
        </div>
      }
      <b>{props.title}</b>
    </div>
  </>
}

function RatingRows(props) {

  const [parent] = useAutoAnimate({ duration: 500, });

  const impossible = filterBetween(display.value, 0, 0)
  const silly = filterBetween(display.value, 1, 4)
  const unsure = filterBetween(display.value, 5, 5);
  const sensible = filterBetween(display.value, 6, 9)
  const certain = filterBetween(display.value, 10, 10)

  return <>
    <div ref={parent}>
      {impossible.length > 0 &&
        <RatingHeader title="Certainly false" />
      }
      {impossible.map((tuple) => {
        const [id, statement, confidence] = tuple;
        return <div key={id} class="rating-row">
          <div class={'rating-slider confidence-' + confidence}>
            <input id={'input-' + id} class="slider"
              type="range" min="0" max="10"
              disabled={props.locked} value={confidence}
              onChange={(e) => setRating(id, e.currentTarget.value)}
            />
          </div>
          <div class="rating-statement">{statement}</div>
        </div>
      })}
      {silly.length > 0 &&
        <RatingHeader title="More likely false" />
      }
      {silly.map((tuple) => {
        const [id, statement, confidence] = tuple;
        return <div key={id} class="rating-row">
          <div class={'rating-slider confidence-' + confidence}>
            <input id={'input-' + id} class="slider"
              type="range" min="0" max="10"
              disabled={props.locked} value={confidence}
              onChange={(e) => setRating(id, e.currentTarget.value)}
            />
          </div>
          <div class="rating-statement">{statement}</div>
        </div>
      })}
      {unsure.length > 0 &&
        <RatingHeader title="No opinion either way" />
      }
      {unsure.map(tuple => {
        const [id, statement, confidence] = tuple;
        return <div key={id} class="rating-row">
          <div class={'rating-slider confidence-' + confidence}>
            <input id={'input-' + id} class="slider"
              type="range" min="0" max="10"
              disabled={props.locked} value={confidence}
              onChange={(e) => setRating(id, e.currentTarget.value)}
            />
          </div>
          <div class="rating-statement">{statement}</div>
        </div>
      })}
      {sensible.length > 0 &&
        <RatingHeader title="More likely true" />
      }
      {sensible.map(tuple => {
        const [id, statement, confidence] = tuple;
        return <div key={id} class="rating-row">
          <div class={'rating-slider confidence-' + confidence}>
            <input id={'input-' + id} class="slider"
              type="range" min="0" max="10"
              disabled={props.locked} value={confidence}
              onChange={(e) => setRating(id, e.currentTarget.value)}
            />
          </div>
          <div class="rating-statement">{statement}</div>
        </div>
      })}
      {certain.length > 0 &&
        <RatingHeader title="Certainly true" />
      }
      {certain.map(tuple => {
        const [id, statement, confidence] = tuple;
        return <div key={id} class="rating-row">
          <div class={'rating-slider confidence-' + confidence}>
            <input id={'input-' + id} class="slider"
              type="range" min="0" max="10"
              disabled={props.locked} value={confidence}
              onChange={(e) => setRating(id, e.currentTarget.value)}
            />
          </div>
          <div class="rating-statement">{statement}</div>
        </div>
      })}
    </div >
  </>;
}

function Header(props) {
  return <header>
    <h1>
      <a href="/">
        <div class="waviy">
          <p class="no-break">
            <span style="--i:0">C</span>
            <span style="--i:1">o</span>
            <span style="--i:1">n</span>
            <span style="--i:3">s</span>
            <span style="--i:1">p</span>
            <span style="--i:1">i</span>
            <span style="--i:1">r</span>
            <span style="--i:1">a</span>
            <span style="--i:0">c</span>
            <span style="--i:1">y</span>
          </p>
          <p class="no-break">
            <span style="--i:3">S</span>
            <span style="--i:1">p</span>
            <span style="--i:1">e</span>
            <span style="--i:0">c</span>
            <span style="--i:1">t</span>
            <span style="--i:1">r</span>
            <span style="--i:1">u</span>
            <span style="--i:1">m</span>
            <span style="--i:3">s</span>
          </p>
        </div>
      </a>
    </h1>
    <div class="subtitle">Share your confidence, for better conversations</div>
  </header>
}

function Footer(props) {
  return <footer>
    <h2>Comments and ideas?</h2>
    <p>
      With any suggestions, including new spectrums, contact:
    </p>
    <div class="button-list">
      <a href="mailto:nigel@chapman.id.au">Nigel Chapman</a>
    </div>
  </footer>
}

function ExplainSpectrums(props) {
  return <div class="explain-spectrums">
    <h2>About conspiracy spectrums</h2>

    <p>The concept of a conspiracy spectrum comes from Mick West's
      2018 book <i>Escaping the Rabbit Hole</i>. Conspiracy
      beliefs exist in topical groups, and a spectrum shows the
      degree of confidence that a person gives to each individual
      belief in that group. The overall pattern may well be
      unique to that person, and understanding this may lead to
      clearer conversations.</p>

    <ul>

      <li>Spectrums can show that we all believe in some conspiracies
        and disbelieve in others. This takes some of the sting out
        of the term 'conspiracy theory'.</li>

      <li>Conspiracy spectrums also make it clear that individuals
        give conspiracy ideas different degrees of conviction or
        confidence or seriousness. This helps avoid misunderstandings
        caused by wrong assumptions.</li>

      <ul>
        <li>We shouldn't assume someone believes in more or
          larger conspiracies than they actually do. They may
          think we're mocking or misrepresenting them,
          lumping them in with <i>the crazies</i>, or using
          extreme ideas to discredit sensible ones.</li>
        <li>And we shouldn't assume that they believe in fewer
          or smaller conspiracies than they actually do.
          Big conspiracies override smaller ones: there's not
          much point discussing whether COVID has been <i>exploited</i> for
          commercial gain if a person thinks it was <i>created</i> for
          that purpose.</li>
      </ul>

      <li>West suggests that any individual will be able to draw a
        dividing line between what they see as sensible theories on
        the one hand, and silly theories or disinformation on the
        other. Informative discussions will most likely happen
        either side of this line, where there are already arguments
        either way.</li>

      <li>Conspiracy spectrums also prompt a range of useful
        questions, the most important of which concern the reasons for
        their various beliefs. Of course, these questions work best if
        you're seeking genuine understanding, not just trying to
        score points.</li>

      <ul>
        <li>Why don't you think this statement is a 10 (or a zero?)</li>
        <li>Why do you think this statement is more likely than that one?</li>
        <li>Can those two both be equally high in confidence?
          (Don't they contradict each other?)</li>
        <li>What future discoveries would make you more confident
          about this one? Or less?</li>
        <li>You're an 8 on this, but I'm only a 2. How could I get
          to having 8/10 confidence?</li>
      </ul>

    </ul>

    <h2>More information</h2>

    <p>This site was created for the 2022 ISCAST publication:</p>

    <div class="button-list">
      <a target="_blank" href="https://iscast.org/conspiracy/">
        Who to Trust? Christian Belief in Conspiracy Theories
      </a>
    </div>

  </div>
}

render(<App />, document.getElementById('app'));
