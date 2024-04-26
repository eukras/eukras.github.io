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

import { getConfidence, getSensibility, sortRatings } from './ratings';
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
      <ExplainSpectrums />
    </main>
    <Footer />
  </div>
}

function EnterRatings(props) {
  return <div class="enter-ratings" >
    <Header />
    <main>
      <h2>{spectrum['name']}</h2>
      <p>
        On a scale of 0 to 10, how confident are you about each of the
        following statements? Where would you draw the line between the
        statements that are silly and the ones that are sensible? Assume that
        zero means an absolute impossibility, ten means you'd bet your life
        on it, and five means that you have no opinion one way or the other.
        Initial values are random, and rows will sort themselves as you go.
      </p>
      <RatingTable locked={false} />
      <div class="button-list">
        <a class="button button-primary" href={writeUrl(spectrum, ratings.value)} target="_blank">Share your answers</a>
        <a href={'/index.html'} class="button button-secondary">See other spectrums</a>
      </div>
      <h2>Why share?</h2>
      <p>Conspiracy theories can be especially hard to discuss if
        we only rely on assumptions about what we each believe. <a
          href="https://twitter.com/hashtag/ConspiracySpectrums">#ConspiracySpectrums</a> save
        us guessing, and can lead to better conversations. Use the button
        above to share your conspiracy spectrum with friends and family, or
        online, and discuss why you think differently at various
        points. <a href="index.html">More information?</a></p>

      <h2>About this spectrum</h2>
      <p>{spectrum['description']}</p>
    </main>
    <Footer />
  </div>
}

function ShareRatings(props) {
  return <div class="enter-ratings" >
    <Header />
    <main>
      <h2>{spectrum['name']}</h2>
      <p>
        <b>This is <a target="_blank" href={writeUrl(spectrum, ratings.value)}>a shareable link</a> to another person's conspiracy spectrum.</b>
      </p>
      <p class="help">
        They were asked to say how confident they were about the following
        statements, and to draw a line between the silly and the sensible ones.
        Zero means an absolute impossibility, ten means they'd bet their life on it,
        and five means they have no opinion one way or the other. They gave this
        list of statements <b>{getConfidence(display.value)}%</b> total
        confidence, and thought <b>{getSensibility(display.value)}%</b> of them
        were sensible.
      </p>
      <RatingTable locked={true} />
      <h2>Create your own!</h2>
      <p>You can fill in this conspiracy spectrum yourself and share your
        confidence ratings with friends.</p>
      <div class="button-list">
        <a class="button button-primary" href={'?' + spectrum.id} target="_blank">Create your own!</a>
        <a href={'/index.html'} class="button button-secondary">See other spectrums</a>
      </div>
      <h2>About this spectrum</h2>
      <p>{spectrum['description']}</p>
    </main>
    <Footer />
  </div>
}

function RatingTable(props) {
  return <div class="ratings-table">
    <RatingHeader count={true} />
    <RatingRows locked={props.locked} />
    <RatingHeader count={false} />
  </div>
}

function RatingHeader(props) {
  return <div class="rating-row">
    <div class="rating-slider number-legend">
      {[' 0', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((key) => <small>{key}</small>)}
    </div>
    <div class="rating-statement text-right">
      {props.count && <small>(done {Object.keys(checked.value).length} of {display.value.length} rows)</small>}
    </div>
  </div>
}

function RatingRows(props) {
  const [parent] = useAutoAnimate({ duration: 500, });
  return <>
    <div ref={parent}>
      {display.value.map((tuple) => {
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
          {id == '__' && <div class="rating-statement text-center text-divider">
            <div>SILLY IDEAS</div>
            <hr class="dashed" />
            <div>SENSIBLE IDEAS</div>
          </div>}
          {id != '__' && <div class="rating-statement">{statement}</div>}
        </div>
      })}
    </div>
  </>;
}


function Header(props) {
  return <header>
    <h1>
      <a href="index.html">Conspiracy Spectrums</a>
    </h1>
    <div class="subtitle">Share your answers, for better conversations</div>
  </header>
}

function Footer(props) {
  return <footer>
    <h2>Comments and ideas?</h2>
    <p>
      With comments and ideas, or to suggest new spectrums, contact <a
        href="mailto:nigel@chapman.id.au">nigel@chapman.id.au</a>.
    </p>
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

    <p>This site was created for the ISCAST publication <a target="_blank"
      href="https://iscast.org/conspiracy/">Who to Trust? Christian Belief in
      Conspiracy Theories</a> (2022), which offers a popular-level introduction
      to current research on conspiracy theories and considers them from a
      Christian ethical viewpoint.</p>

  </div>
}

render(<App />, document.getElementById('app'));
