/**
 * A simple conspiracy spectrum tool. Allows easy sharing of a person's degree of confidence in a range of related statements.
 *
 * Based on Mick West, 'Escaping the Rabbit Hole' (2018), ch.2.
 *
 * PAGE 1: Select a spectrum.
 *  - index.html (or anything not matching...)
 *
 * PAGE 2: Select confidence in each statement. Sort table dynamically. Move divider to show where sensibility begins.
 *  - index.html?covid_19
 *
 * PAGE 3: Display a shareable results link.
 *  - index.html#SUQ9Y292aWRfMTkmdHk9OSZjcz0xM... (etc)
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

import { filterBetween, getConfidence, getSensibility, sortRatings } from './ratings';
import { SPECTRUMS } from './spectrums';
import { readUrl, writeUrl } from './uri';

const COLORS = [
  "#defde0", "#def9ec", "#def5f7", "#e2effd",
  "#e9e7fd", "#f0defd", "#f5def1", "#fadfe5",
  "#fde4df", "#fceede", "#fcf7de"
];

import './style.css';

const [spectrum, ratingsObj, locked] = readUrl(SPECTRUMS);

const ratings = signal(ratingsObj);
const checked = signal({});
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
  checked.value = {
    ...checked.value,
    [id]: true,
  }
  display.value = sortRatings(spectrum, ratings.value);
}

function setChecked(id) {
  checked.value = {
    ...checked.value,
    [id]: true,
  }
  display.value = sortRatings(spectrum, ratings.value);
}

function SelectSpectrum(props) {
  return <div>
    <Header />
    <main>
      <div class="button-list">
        {Object.entries(SPECTRUMS).map(([id, spectrum]) => {
          return <a href={"?" + id}>{spectrum['name']}</a>
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
      <RatingsLegend />
      <h2>{spectrum['name'].replace(' *', '')}</h2>
      {spectrum['name'].includes(' *') &&
        <p class="highlight"><small><b>Note.</b> This spectrum assumes a detailed knowledge of its topic.</small></p>
      }
      <p>Rate the {display.value.length} statements below on a scale of zero to ten.</p>
      <RatingTable locked={false} />

      <div class="results">
        <h2>Your results</h2>
        <p>You gave this list of statements <b>{getConfidence(display.value)}%</b> total
          confidence.</p>
        <p>You thought <b>{getSensibility(display.value)}%</b> of
          them were sensible ideas.</p>
      </div>
      <div class="button-list">
        <a href={writeUrl(spectrum, ratings.value)} target="_blank">Share your confidence</a>
        <a href={'/index.html'}>See other spectrums</a>
      </div>

      <h2>Why share?</h2>
      <p>Conspiracy theories can be especially hard to discuss if
        we only rely on assumptions about what we each believe. save
        us guessing, and can lead to better conversations. Use the button
        above to share your conspiracy spectrum with friends and family, or
        online, and discuss why you think differently at various
        points.</p>
      <div class="button-list">
        <a href="https://twitter.com/hashtag/ConspiracySpectrums">#Conspiracy&shy;Spectrums</a>
        <a href="index.html">More information?</a>
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
      <RatingsLegend />
      <h2>{spectrum['name'].replace(' *', '')}</h2>
      <p class="highlight">
        This is a shareable link to another person's conspiracy spectrum.
      </p>
      <p class="help">
        They were asked to say how confident they were about the {display.value.length} statements below, and to identify which they thought were at least sensible.
      </p>
      <p>They gave this list of statements <b>{getConfidence(display.value)}%</b> total
        confidence.</p>
      <p>They thought <b>{getSensibility(display.value)}%</b> of these statements
        were sensible.</p>
      <RatingTable locked={true} />
      <h2>Create your own!</h2>
      <p>You can fill in this conspiracy spectrum yourself and share your
        confidence ratings with friends.</p>
      <div class="button-list">
        <a href={'?' + spectrum.id} target="_blank">Create your own!</a>
        <a href={'/index.html'} class="button button-secondary">See other spectrums</a>
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
      <tr><td>Certainly false</td><td>Silly or doubtful</td><td>No opinion either way</td><td>Sensible or plausible</td><td>Certainly true</td></tr>
    </table>
    <table class="show-mobile">
      <tr>
        <th>0</th>
        <td>Certainly false</td>
      </tr>
      <tr>
        <th>1 – 4</th>
        <td>Silly or doubtful</td>
      </tr>
      <tr>
        <th>5</th>
        <td>No opinion either way</td>
      </tr>
      <tr>
        <th>6 – 9</th>
        <td>Sensible or plausible</td>
      </tr>
      <tr>
        <th>10</th>
        <td>Certainly true</td>
      </tr>
    </table>
  </>
}

function RatingTable(props) {
  return <div class="ratings-table">
    <RatingHeader count={true} />
    <RatingRows locked={props.locked} />
    <RatingSummary />
  </div>
}

function RatingSummary(props) {
  return <div class="rating-header space-around">
    {props.count && <small>(done {Object.keys(checked.value).length} of {display.value.length} rows)</small>}
  </div>;
}

function RatingHeader(props) {
  return <>
    <div class="rating-row rating-reverse-order">
      <div class="rating-slider">
        <div class="rating-legend space-between">
          {[' 0', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((key) => {
            return <small>{key}</small>
          })}
        </div>
      </div>
      <div class="rating-statement text-right hide-mobile">
      </div>
    </div>
  </>
}

function RatingRows(props) {
  const [parent] = useAutoAnimate({ duration: 500, });

  const impossible = filterBetween(display.value, 0, 0)
  const not_impossible = filterBetween(display.value, 1, 10)
  const silly = filterBetween(display.value, 1, 4)
  const not_silly = filterBetween(display.value, 5, 10)
  const unsure = filterBetween(display.value, 5, 5);
  const sensible = filterBetween(display.value, 6, 9)
  const not_sensible = filterBetween(display.value, 1, 5)
  const certain = filterBetween(display.value, 10, 10)
  const not_certain = filterBetween(display.value, 0, 9)

  return <>
    <div ref={parent}>
      {impossible.map((tuple) => {
        const [id, statement, confidence] = tuple;
        const classNames = 'slider' + (checked.value[id] === true ? ' checked' : '')
        return <div key={id} class="rating-row">
          <div class="rating-slider" style={{ 'background-color': COLORS[confidence] }}>
            <input id={'input-' + id} class={classNames}
              type="range" min="0" max="10"
              disabled={props.locked} value={confidence}
              onChange={(e) => setRating(id, e.currentTarget.value)}
              onClick={(e) => setChecked(id)}
            />
          </div>
          <div class="rating-statement">{statement}</div>
        </div>
      })}
      {impossible.length > 0 && not_impossible.length > 0 &&
        <div key="silly" class="rating-statement text-center text-divider">
          <div>Certainly false ideas above this line</div>
        </div>
      }
      {silly.map((tuple) => {
        const [id, statement, confidence] = tuple;
        const classNames = 'slider' + (checked.value[id] === true ? ' checked' : '')
        return <div key={id} class="rating-row">
          <div class="rating-slider" style={{ 'background-color': COLORS[confidence] }}>
            <input id={'input-' + id} class={classNames}
              type="range" min="0" max="10"
              disabled={props.locked} value={confidence}
              onChange={(e) => setRating(id, e.currentTarget.value)}
              onClick={(e) => setChecked(id)}
            />
          </div>
          <div class="rating-statement">{statement}</div>
        </div>
      })}
      {silly.length > 0 && not_silly.length > 0 &&
        <div key="silly" class="rating-statement text-center text-divider">
          <div>Silly or doubtful ideas above this line</div>
        </div>
      }
      {unsure.map(tuple => {
        const [id, statement, confidence] = tuple;
        const classNames = 'slider' + (checked.value[id] === true ? ' checked' : '')
        return <div key={id} class="rating-row">
          <div class="rating-slider" style={{ 'background-color': COLORS[confidence] }}>
            <input id={'input-' + id} class={classNames}
              type="range" min="0" max="10"
              disabled={props.locked} value={confidence}
              onChange={(e) => setRating(id, e.currentTarget.value)}
              onClick={(e) => setChecked(id)}
            />
          </div>
          <div class="rating-statement">{statement}</div>
        </div>
      })}
      {sensible.length > 0 && not_sensible.length > 0 &&
        <div key="sensible" class="rating-statement text-center text-divider">
          <div>Sensible or plausible ideas below this line</div>
        </div>
      }
      {sensible.map(tuple => {
        const [id, statement, confidence] = tuple;
        const classNames = 'slider' + (checked.value[id] === true ? ' checked' : '')
        return <div key={id} class="rating-row">
          <div class="rating-slider" style={{ 'background-color': COLORS[confidence] }}>
            <input id={'input-' + id} class={classNames}
              type="range" min="0" max="10"
              disabled={props.locked} value={confidence}
              onChange={(e) => setRating(id, e.currentTarget.value)}
              onClick={(e) => setChecked(id)}
            />
          </div>
          <div class="rating-statement">{statement}</div>
        </div>
      })}
      {certain.length > 0 && not_certain.length > 0 &&
        <div key="certain" class="rating-statement text-center text-divider">
          <div>Certainly true ideas below this line</div>
        </div>
      }
      {certain.map(tuple => {
        const [id, statement, confidence] = tuple;
        const classNames = 'slider' + (checked.value[id] === true ? ' checked' : '')
        return <div key={id} class="rating-row">
          <div class="rating-slider" style={{ 'background-color': COLORS[confidence] }}>
            <input id={'input-' + id} class={classNames}
              type="range" min="0" max="10"
              disabled={props.locked} value={confidence}
              onChange={(e) => setRating(id, e.currentTarget.value)}
              onClick={(e) => setChecked(id)}
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
      <a href="index.html">
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
