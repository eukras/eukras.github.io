/**
 * @package 
 * @author Nigel Chapman <nigel@chapman.id.au>
 */
import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

import spectrums from './spectrums.js'

const shuffle = (unshuffled) => unshuffled
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

const sortStatements = (unsorted) => unsorted
    .sort((a, b) => {
        const [aKey, aStatement, aConfidence] = a;
        const [bKey, bStatement, bConfidence] = b;
        if (aConfidence == bConfidence) {
            return aStatement > bStatement ? 1 : -1;
        } else {
            return aConfidence > bConfidence ? 1 : -1;
        }
    });

//  For a genuine Unicode sparkline: 
//  .map(i => i == null ? "/" : ".▁▂▃▄▄▅▆▇█!"[i])
const sparkline = (zerototens) => zerototens
    .filter(i => i == null || (i => i >= 0 && i <= 10))
    .map(i => i == null ? "/" : "0123456789X"[i])
    .join('');

const encodeBase64 = (str) => {
    return window.btoa(unescape(encodeURIComponent(str)));
}
const decodeBase64 = (str) => {
  return decodeURIComponent(escape(window.atob( str )));
}

class App extends Component {

    constructor() {
        super();
        this.colors = this.getColorScale();
        this.state = {
            spectrum: null,
            format: 'shuffle',
            locked: false,
        };
        this.checkUrl();
    }

    checkUrl() {
        //  index.html?covid_19
        const search = window.location.search.slice(1);
        if (search in spectrums) {
            this.initialize(search, {}, 'shuffle');
        } else {
            //  index.html#SUQ9Y292aWRfMTkmdHk9OSZjcz0xM... (etc)
            const data = this.readUrl();
            if ('ID' in data) {
                this.initialize(data.ID, data, 'sort');
            }
        }
    }

    initialize(spectrumId, statements, format) {
        const spectrum = spectrumId in spectrums
            ? spectrums[spectrumId]
            : null;
        if (spectrum == null) {
            this.setState({spectrum: null});
            return;
        }
        const useStatements = statements != undefined ? statements : {};
        const newStatements = spectrum.statements.map(tuple => {
            const [key, statement] = tuple;
            const newConfidence = key in useStatements 
                ? statements[key]
               : 5;
            return [key, statement, newConfidence];
        });
        const newFormat = format != undefined ? format : 'shuffle';
        const newLocked = newFormat == 'sort' ? true : false;
        const newSpectrum = {
            ...spectrum,
            statements: newFormat == 'shuffle'
                ? shuffle(newStatements)
                : sortStatements(newStatements),
            format: newFormat,
            locked: newLocked,
        };
        this.setState({spectrum: newSpectrum});
    }

    getSparkline() {
        //  Return null for divider, confidence integer for other rows
        const confidences = this.state.spectrum.statements.map(tuple => {
            const [key, statement, confidence] = tuple;
            return key == '__' ? null : confidence;
        });
        return sparkline(confidences);
    }

    getColorScale() {
        //  Pastel scheme from: 
        //  https://www.schemecolor.com/beautiful-light-pastels-color-scheme.php
        //  Scale generated with Chroma:
        //  const pastels = ['#DEFDE0', '#DEF3FD', '#F0DEFD', '#FDDFDF', '#FCF7DE'];
        //  const scale = chroma.scale(pastels).mode('lrgb').colors(11);
        //  return scale;
        return [
            "#defde0","#def9ec","#def5f7",
            "#e2effd","#e9e7fd",
            "#f0defd",
            "#f5def1","#fadfe5",
            "#fde4df","#fceede","#fcf7de"
        ];
    }

    readUrl() {
        const hash = window.location.hash.slice(1);
        const uri = decodeBase64(hash);
        const pairs = uri.split('&').reduce((acc, pair) => {
            const [key, val] = pair.split('=');
            acc[key] = Number.isInteger(parseInt(val)) ? parseInt(val) : val;
            return acc;
        }, {});
        return pairs;
    }
    
    getScore() {
        const rowsThatCount = this.state.spectrum.statements.filter(val => val[0] != '__');
        const sum = rowsThatCount.reduce((acc, val) => {
            return acc + val[2];
        }, 0);
        return Math.round(sum * 10 / rowsThatCount.length);
    }

    setShuffleFormat() {
        const spectrum = this.state.spectrum;
        if (this.spectrum !== null) {
            this.setState({
                spectrum: {
                    ...spectrum,
                    format: 'shuffle',
                    statements: shuffle(spectrum.statements),
                },
            });
        }
    }

    setSortFormat() {
        const sorted = sortStatements(this.state.spectrum.statements);
        this.setState({
            spectrum: {
                ...this.state.spectrum,
                statements: sorted,
                format: 'sort',
            }
        });
    }

    setConfidence(key, confidence) {
        const intConfidence = parseInt(confidence) || 0;
        const newStatements = this.state.spectrum.statements.map((tuple) => {
            const [thisKey, thisStatement, thisConfidence] = tuple;
            return [thisKey, thisStatement, thisKey == key ? intConfidence : thisConfidence];
        });
        const sorted = this.state.spectrum.format == 'shuffle'
            ? newStatements
            : sortStatements(newStatements)
        this.setState({
            spectrum: {
                ...this.state.spectrum,
                statements: sorted,
            },
        });
    }

    writeUrl() {
        const spectrum = this.state.spectrum;
        const urlParts = spectrum?.statements.map((tuple) => {
            const [thisKey, thisStatement, thisConfidence] = tuple;
            return '&' + thisKey + '=' + thisConfidence;
        });
        const data = 'ID=' + spectrum?.id + urlParts.join('');
        return '/index.html#' + encodeBase64(data);
    }

    toggleDivider() {
        if (this.hasDivider()) {
            this.removeDivider();
        } else {
            this.addDivider();
        }
    }

    hasDivider() {
        const spectrum = this.state.spectrum;
        return spectrum.statements.reduce((acc, val) => {
            return val[0] == '__' || acc;
        }, false);
    }

    addDivider() {
        const spectrum = this.state.spectrum;
        const newStatements = [
            ...spectrum.statements,
            ['__', '--- D I V I D E R ---', 7]
        ];
        const sorted = sortStatements(newStatements);
        this.setState({
            spectrum: {
                ...spectrum,
                statements: sorted,
            }
        });
    }

    removeDivider() {
        const spectrum = this.state.spectrum;
        this.setState({
            spectrum: {
                ...spectrum,
                statements: spectrum.statements.filter(statement => {
                    return statement[0] != '__';
                }),
            }
        });
    }

    render() {
        const spectrum = this.state.spectrum;
        return html`
            <div class="page-wrapper">
            ${!spectrum && html`

                <h1>Conspiracy Spectrums</h1>

                <p style="margin: 2rem;">
                ${Object.entries(spectrums).map(([key, spec]) => html`
                    <a class="button button-primary" href=${'/index.html?' + spec.id}>${spec.name}</a>
                `)}
                </p>

                <p class="question">A way to have better conversations about conspiracy theories</p>

                <p>The idea of conspiracy spectrums comes from Mick West's 2018
                book <i>Escaping the Rabbit Hole</i>. A spectrum shows the
                degree of confidence that a person gives to each belief in a
                group, and is unique to that individual. Spectrums are a useful
                tool for improving conversations about conspiracy theories:</p>

                <!-- 
                <figure>
                    <img src="images/conspiracy-spectrum-west-2018.png" alt="A conspiracy spectrum from Escaping the Rabbit Hole (ch. 2)." />
                    <figcaption>A conspiracy spectrum from <i>Escaping the Rabbit Hole</i> (ch. 2).</figcaption>
                </figure>

                <p>The beliefs in this spectrum appear in the 'US 2010s'
                conspiracy spectrum on this webpage (see above).</p>
                -->

                <ol>

                <li>We all believe in some conspiracies and disbelieve in
                others. Conspiracy spectrums can make this clear, which takes
                some of the sting out of the term 'conspiracy theory'.</li>

                <blockquote>
                Conspiracies are very real, of course. The fact that powerful
                people make secret plans at the expense of the general public
                should come as no surprise to anyone. Nixon conspired to cover
                up Watergate. The CIA staged “false flag” operations in 1953 to
                bring down the Iranian government. Powerful men in the Reagan
                administration conspired to illegally trade arms with Iran to
                finance the Nicaraguan Contras. Enron conspired to shut down
                power stations to raise the price of electricity. Executives
                from Archer Daniels Midland conspired to fix the price of
                animal feed. People within the second Bush administration
                conspired to present sketchy evidence as conclusive proof of
                WMDs to justify the invasion of Iraq. Politicians tacitly (and
                sometimes overtly) conspire with wealthy individuals
                and corporations, helping pass favorable legislation in
                exchange for campaign contributions, or sometimes just bribes.
                The prison industry conspires to get those politicians to
                incarcerate more people simply to maximize their profits.
                <div class="caption">(West 2018, <i>Introduction</i>)</div>
                </blockquote>

                <li>Conspiracy spectrums recognise different degrees of
                conviction or confidence or seriousness. This helps avoid
                misunderstandings over wrong assumptions. It will hamper your
                conversations if you assume someone believes in more or larger
                conspiracies than they actually do. They may think you're
                mocking or misrepresenting them, lumping them in with the
                crazies, or using more extreme ideas to discredit more sensible
                ones. And it will equally hamper your conversations if you
                assume that they believe in fewer or smaller conspiracies than
                they actually do, since bigger conspiracies will override
                smaller ones. There's no point discussing whether COVID has
                been <i>exploited</i> for commercial gain if a person thinks it
                was <i>created</i> for that purpose.</li>

                <li>West suggests that any individual will be able to draw a
                dividing line between what they see as sensible theories on the
                one hand, and silly theories or disinformation on the other.
                Informative discussions will most likely happen near this
                line.</li>

                <li>Putting degrees of confidence on a spectrum may also lead to
                better understanding by prompting a range of questions. Note this 
                works best if you're seeking understanding, not gotchas and
                zingers.</li>

                <ol>
                    <li>Why don't you think this deserves complete confidence?</li>
                    <li>Why do you think this is more likely than that?</li>
                    <li>Can those two both be equally high in confidence?
                    (Don't they contradict each other?)</li>
                    <li>What future discoveries would make you more confident
                    about this? Or less?</li>
                </ol>

                </ol>
                `}

            ${spectrum && html`
                <p>
                    <a class="button" href="/index.html">Conspiracy Spectrums</a>
                    <button class="button button-decorative">${spectrum.name}</button>
                </p>
                ${spectrum.locked && html`
                <p class="notice">
                    <b>This is a link to another person's ${spectrum.name} conspiracy spectrum.</b><br/>To enter your own responses, <a href="/index.html?${spectrum.id}" target="_blank">click here</a>.
                </p>
                `}
                <p class="question">On a scale from total disbelief to absolute certainty, how confident are you that:</p>
                <div class="spectrum">
                ${spectrum.statements.map(([key, statement, confidence]) => {
                    const rowColor = key == '__' ? '#f7a6c8' : this.colors[confidence];
                    const rowStyle = spectrum?.format == 'shuffle' ? '' : 'background-color:' + rowColor;
                    const rowDivider = key == '__' ? " spectrum-divider" : "";
                    if (spectrum.format == 'shuffle' && key == '__') {
                        return null; // Don't show divider
                    }
                    return html`
                    <div class="spectrum-row">
                        <div class=${"spectrum-cell slider-container" + rowDivider} style=${rowStyle}>
                            <input type="range" class="slider" min="0" max="10"
                                disabled=${spectrum.locked}
                                value=${confidence} id=${key}
                                onchange=${(e) => this.setConfidence(key, e.target.value)}
                            />
                        </div>
                        <div class=${"spectrum-cell" + rowDivider}>${statement}</div>
                    </div>
                    `}
                )}
                </div>

                <ul>
                    <li>Use <a target="_blank" href=${this.writeUrl()}>this link</a> to bookmark your answers or share them with others.</li>
                </ul>

                <p>
                    <button class="button" disabled=${spectrum.locked} onclick=${() => this.setShuffleFormat()}>Shuffle</button>
                    <button class="button" disabled=${spectrum.locked} onclick=${() => this.setSortFormat()}>Sort</button>

                    ${spectrum?.format == 'sort' && html`
                        <button class="button" disabled=${spectrum.locked} onclick=${() => this.toggleDivider()}>${this.hasDivider() ? "Remove Divider" : "Add Divider"}</button>
                        <button disabled="true" class="button-decorative">${this.getScore() + '%'}</button>
                    `}

                </p>

                <ul>
                    ${this.hasDivider() && spectrum.format != 'shuffle' && html`
                    <li>The divider can be moved around to separate silly theories and misinformation (above) from sensible theories (below).</li>
                    `}
                    <li>${spectrum.description}</li>
                </ul>

            `}

            <div class="byline">Send comments or ideas to @<a href="https://twitter.com/eukras">eukras</a> on Twitter.</div>

            </div>
        `;
    }
};

const html = htm.bind(h);
render(html`<${App} />`, document.body);
