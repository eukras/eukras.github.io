/**
 * Simple conspiracy spectrum tool.
 *
 * PAGE 1: Select spectrum from spectrum.js.
 * PAGE 2: Order and share conspiracy spectrum (3 steps).
 *
 * - STEP 1: Shuffle table. Select confidence in each row. Push button.
 * - STEP 2: Show sorted results. Move divider to show where sensibility begins.
 * - STEP 3: Shareable link.
 *
 * @package Conspiracy Spectrums
 * @author Nigel Chapman <nigel@chapman.id.au>
 */

import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

import spectrums from './spectrums.js'

/**
 * Global utilities
 */

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

const encodeBase64 = (str) => {
    return window.btoa(unescape(encodeURIComponent(str)));
}
const decodeBase64 = (str) => {
    return decodeURIComponent(escape(window.atob( str )));
}

const addDivider = (statements) => {
    const newStatements = [
        ...statements,
        ['__', '▲ Silly  ▼ Sensible', 5]
    ];
    return sortStatements(newStatements);
}

const removeDivider = (statements) => {
    return statements.filter(statement => {
        return statement[0] != '__';
    })
}

const getDivider = (statements) => {
    for (let i=0; i < statements.length; i++) {
        if (statements[i][0] == '__') {
            return statements[i][2];
        }
    }
    return 0;
}

const getConfidence = (statements) => {
    const rowsThatCount = removeDivider(statements);
    const sum = rowsThatCount.reduce((acc, val) => {
        return acc + val[2];
    }, 0);
    return Math.round(sum * 10 / rowsThatCount.length);
}

const getSensible = (statements) => {
    const divider = getDivider(statements);
    const numSensible = statements
        .filter(statement => statement[0] != '__')
        .map(statement => statement[2])
        .filter(confidence => confidence >= divider)
        .length;
    const numStatements = statements
        .filter(val => val[0] != '__')
        .length;
    console.log(divider, numSensible, numStatements);
    return Math.round(numSensible * 100 / numStatements);
}

const getSummary = (statements) => {
    return getConfidence(statements) + '% total confidence, ' +
        getSensible(statements) + '% rated sensible';
}

/**
 * UNUSED
 */
const getSparkline = (statements) => {

    //  For a genuine Unicode sparkline: 
    //  .map(i => i == null ? "/" : ".▁▂▃▄▄▅▆▇█!"[i])
    const formatSparkline = (numbers) => numbers
        .filter(i => i => i >= 0 && i <= 10)
        .map(i => "0123456789X"[i])
        .join('');

    //  Return null for divider, confidence integer for other rows
    const divider = getDivider(statements);
    const confidences = statements
        .filter(statement => statement[0] != '__')
        .map(statement => statement[2])
        .filter(confidence => confidence >= divider)

    return formatSparkline(confidences, divider);
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
        const search = window.location.search.slice(1);
        if (search in spectrums) {
            //  index.html?covid_19
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
        const baseStatements = format != 'shuffle' && '__' in useStatements
            ? [...spectrum.statements, ['__', '▲ Silly  ▼ Sensible', 5]]
            : spectrum.statements;
        const newStatements = baseStatements.map(tuple => {
            const [key, statement] = tuple;
            const newConfidence = key in useStatements
                ? useStatements[key]
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

    setShuffleFormat() {
        const spectrum = this.state.spectrum;
        const shuffled = shuffle(removeDivider(spectrum.statements));
        if (this.spectrum !== null) {
            this.setState({
                spectrum: {
                    ...spectrum,
                    format: 'shuffle',
                    statements: shuffled,
                },
            });
        }
    }

    setSortFormat() {
        window.scroll(0,0);  // <-- back to top
        const sorted = sortStatements(addDivider(this.state.spectrum.statements))
        this.setState({
            spectrum: {
                ...this.state.spectrum,
                format: 'sort',
                statements: sorted,
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

    render() {
        const spectrum = this.state.spectrum;
        return html`
            <div class="page-wrapper">
            ${!spectrum && html`

                <p style="margin: 2rem; text-align: center;">
                ${Object.entries(spectrums).map(([key, spec]) => html`
                    <a class="button button-primary" href=${'/index.html?' + spec.id}>${spec.name}</a>
                `)}
                </p>

                <h1>Conspiracy Spectrums</h1>

                <div class="text-wrapper">

                <h3>Need some clearer conversations on conspiracy theories?</h3>

                <p>The concept of conspiracy spectrums is taken from Mick
                West's 2018 book <i>Escaping the Rabbit Hole</i>. Conspiracies
                exist in topical groups, and a conspiracy spectrum shows the
                degree of confidence that a person gives to each belief in a
                group. This is likely unique to each individual.</p>

                <ul>

                <li>Spectrums help to show that we all believe in some
                conspiracies and disbelieve in others. This takes some of the
                sting out of the term 'conspiracy theory'.</li>

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

                <li>Conspiracy spectrums also make it clear that individuals
                give conspiracy ideas different degrees of conviction or
                confidence or seriousness. This helps avoid misunderstandings
                caused by wrong assumptions. It will hamper our conversations if
                we assume someone believes in more or larger conspiracies than
                they actually do. They may think we're mocking or
                misrepresenting them, lumping them in with the crazies, or
                using more extreme ideas to discredit more sensible ones. And
                it will equally hamper our conversations if we assume that
                they believe in fewer or smaller conspiracies than they
                actually do, since bigger conspiracies will override smaller
                ones. For example, there's no point discussing whether COVID
                has been <i>exploited</i> for commercial gain if a person
                thinks it was <i>created</i> for that purpose. West suggests
                that any individual will be able to draw a dividing line
                between what they see as sensible theories on the one hand, and
                silly theories or disinformation on the other.  Informative
                discussions will most likely happen near this line.</li>

                <li>Conspiracy theories also prompt a range of useful
                questions. Though note these questions work best if you're
                seeking genuine understanding, not gotchas and zingers.</li>

                <ol>
                    <li>Why don't you think this one deserves complete confidence?</li>
                    <li>Why do you think this one is more likely than <i>that one</i>?</li>
                    <li>Can those two both be equally high in confidence?
                    (Don't they contradict each other?)</li>
                    <li>What future discoveries would make you more confident
                    about this? Or less?</li>
                    <li>You're an 8 on this, but I'm only a 2. How could I get
                    to being a number 8?</li>
                </ol>

                </ol>

                </div>

                <p class="contact">
                    Comments and ideas to <a
                    href="https://twitter.com/eukras">@eukras</a> on
                    Twitter
                </p>
            `}

            ${spectrum && html`
                <p>
                    <a class="button" href="/index.html">Conspiracy Spectrums</a>
                    <button disabled=${spectrum.locked} class="button button-decorative">${spectrum.name}</button>
                </p>
                <div class="pure-g">
                    <div class="pure-u-7-24" style="align: right;">
                        <h3>
                        ${!spectrum.locked && spectrum.format == "sort" && html`
                        <button disabled=${spectrum.locked} onclick=${() => this.setShuffleFormat()} class="button button-secondary">◄  Back</button>
                        `}
                        ${spectrum.locked && html`
                            <a class="button button-secondary" href=${this.writeUrl()} target="_blank">Link</a>
                        `}
                        </h3>
                    </div>
                    <div class="pure-u-17-24">
                        ${!spectrum.locked && spectrum.format == "shuffle" && html`
                        <h3>
                            <b>Step 1 of 3</b><br/>
                            How confident are you that...
                        </h3>
                        `}
                        ${!spectrum.locked && spectrum.format == "sort" && html`
                        <h3>
                            <b>Step 2 of 3</b><br/>
                            Where would you draw the line between silly and sensible statements?
                        </h3>
                        `}
                        ${spectrum.locked && html`
                        <h3>
                            This is a shareable link to another person's ${spectrum.name} conspiracy spectrum
                        </h3>
                        <p class="help">
                            They were asked to say how confident they were about the following statements, and to draw a line between the silly and the sensible ones. They gave these ${getConfidence(spectrum.statements)}% total confidence, and thought ${getSensible(spectrum.statements)}% were sensible.
                        </p>
                        `}
                    </div>
                </div>
                <div class="spectrum">
                    <div class="spectrum-row">
                        <div class="spectrum-cell pure-g">
                            <div class="pure-u-1-3"><small>0%</small></div>
                            <div class="pure-u-2-3 text-right"><small>100%</small></div>
                        </div>
                        <div class="spectrum-cell pure-g">
                            <div class="pure-u-1-3"><small></small></div>
                            <div class="pure-u-2-3 text-right">
                                <small>
                                    ${!spectrum.locked && spectrum.format == "shuffle" && html`
                                    <a href="#" onclick=${() => this.setShuffleFormat()}>Shuffle</a>
                                    `} (${removeDivider(spectrum.statements).length})
                                </small>
                            </div>
                        </div>
                    </div>
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

                <div class="pure-g">
                    <div class="pure-u-7-24" style="align: right;">
                    </div>
                    <div class="pure-u-17-24">
                        ${!spectrum.locked && spectrum.format == "shuffle" && html`
                        <p class="space-above">
                            <button class="button" onclick=${() => this.setSortFormat()}>Continue ►</button>
                        </p>
                        `}
                        ${!spectrum.locked && spectrum.format == "sort" && html`
                        <p class="space-above">
                            <a class="button button-primary" href=${this.writeUrl()} target="_blank">Share your answers ►</button>
                        </p>
                        `}
                        ${spectrum.locked && html`
                        <p class="help space-above">
                            <b>Why share?</b><br/>One reason why it's hard to talk about conspiracy theories is that we often rely on assumptions about what each other believe. <a href="https://twitter.com/hashtag/ConspiracySpectrum">#ConspiracySpectrums</a> save us guessing, and can lead to better conversations if we're all willing to share. 
                        </p>
                        <p class="space-above"><a href=${'/index.html?' + spectrum.id} class="button button-primary">Share your own answers</a></p>
                        <p><a href=${'/index.html'} class="button button-secondary">See other spectrums</a></p>
                        `}
                    </div>
                </div>

                <div class="pure-g">
                    <div class="pure-u-7-24">
                    </div>
                    <div class="pure-u-17-24">
                        <p class="help"><b>About this spectrum</b><br/>${spectrum.description}</p>
                    </div>
                </div>

                <p class="contact">Comments and ideas: <a href="https://twitter.com/eukras">@eukras</a> on Twitter</p>
            `}

            </div>
        `;
    }
};

const html = htm.bind(h);
render(html`<${App} />`, document.body);
