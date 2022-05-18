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

const svgLeftArrow = () => {
    //  Font Awesome Free 5.2.0 by @fontawesome - https://fontawesome.com
    //  License - https://fontawesome.com/license (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
    return html`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z"/>
    </svg>
    `;
}

const svgRightArrow = () => {
    //  Font Awesome Free 5.2.0 by @fontawesome - https://fontawesome.com
    //  License - https://fontawesome.com/license (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
    return html`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"/>
    </svg>
    `;
}

const addDivider = (statements) => {
    const newStatements = [
        ...statements,
        ['__', '▲ Silly  ▼ Sensible', 0]
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

const getSensibility = (statements) => {
    const divider = getDivider(statements);
    const numSensible = statements
        .filter(statement => statement[0] != '__')
        .map(statement => statement[2])
        .filter(confidence => confidence > divider)
        .length;
    const numStatements = statements
        .filter(val => val[0] != '__')
        .length;
    return Math.round(numSensible * 100 / numStatements);
}

/**
 * UNUSED
 */
const getSummary = (statements) => {
    return getConfidence(statements) + '% total confidence, ' +
        getSensibility(statements) + '% rated sensible';
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
            ? [...spectrum.statements, ['__', '▲ Silly  ▼ Sensible', 0]]
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

    countRows() {
        const spectrum = this.state.spectrum;
        const n = removeDivider(spectrum.statements).length;
        const s = (n === 1) ? '' : 's';
        return `${n} row${s}`;
    }

    render() {
        const spectrum = this.state.spectrum;
        return html`
            <div class="page-wrapper">
            ${!spectrum && html`

                <h1>Conspiracy Spectrums</h1>

                <p class="button-list button-wrap">
                ${Object.entries(spectrums).map(([key, spec]) => html`
                    <a class="button button-primary" href=${'/index.html?' + spec.id}>${spec.name} ${spec.statements.length > 30 ? ' (Long)' : ''}</a>
                `)}
                </p>

                <div class="text-wrapper">

                <h3>Share your confidence</h3>

                <p>The concept of conspiracy spectrums is taken from Mick
                West's 2018 book <i>Escaping the Rabbit Hole</i>. Conspiracy
                theories exist in topical groups, and a conspiracy spectrum
                shows the degree of confidence that a person gives to each
                individual belief in that group. The overall pattern may well
                be unique to that person, and understanding this may lead to
                clearer conversations about conspiratorial beliefs.</p>

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
                            much point discussing whether COVID has been 
                            <i>exploited</i> for commercial gain if a person
                            thinks it was <i>created</i> for that purpose.</li>
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
                    <li>Why don't you think this statement deserves complete confidence?</li>
                    <li>Why do you think this statement is more likely than that one?</li>
                    <li>Can those two both be equally high in confidence?
                    (Don't they contradict each other?)</li>
                    <li>What future discoveries would make you more confident
                    about this one? Or less?</li>
                    <li>You're an 8 on this, but I'm only a 2. How could I get
                    to being a number 8?</li>
                </ul>

                </ol>

                </div>

                <p class="contact">
                    Comments and ideas to <a target="_blank" href="https://twitter.com/eukras">@eukras</a> on Twitter
                </p>
            `}

            ${spectrum && html`
                <p class="button-wrap">
                    <a class="button" href="/index.html">Conspiracy Spectrums</a>
                    <button disabled=${spectrum.locked} class="button button-decorative">${spectrum.name}</button>
                </p>
                <div class="pure-g">
                    <div class="pure-u-7-24" style="align: right;">
                        <h3>
                        ${!spectrum.locked && spectrum.format == "sort" && html`
                        <button disabled=${spectrum.locked} onclick=${() => this.setShuffleFormat()} class="button button-secondary">${svgLeftArrow()} Back</button>
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
                            They were asked to say how confident they were about the following statements, and to draw a line between the silly and the sensible ones. They gave these ${getConfidence(spectrum.statements)}% total confidence, and thought ${getSensibility(spectrum.statements)}% were sensible.
                        </p>
                        `}
                    </div>
                </div>
                <div class="spectrum">
                    <div class="spectrum-row">
                        <div class="spectrum-cell flex-between">
                            ${[' ', '  0', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ''].map((key) => {
                                return html`
                                    <small>${key}</small>
                                `;
                            })}
                        </div>
                        <div class="spectrum-cell pure-g">
                            <div class="pure-u-1-3"><small></small></div>
                            <div class="pure-u-2-3 text-right">
                                <small>
                                    ${!spectrum.locked && spectrum.format == "shuffle" && html`
                                        ${this.countRows()} : <a href="#" onclick=${() => this.setShuffleFormat()}>Shuffle</a>
                                    `}
                                </small>
                            </div>
                        </div>
                    </div>
                ${spectrum.statements.map(([key, statement, confidence]) => {
                    const rowLabel = (key == '__' && !spectrum.locked && spectrum?.format == 'sort') ? '(adjust the slider)' : '';
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
                        <div class=${"flex-between-g1 spectrum-cell" + rowDivider}>
                            <span>${statement}</span>
                            <small>${rowLabel}</small>
                        </div>
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
                            <button class="button" onclick=${() => this.setSortFormat()}>Continue ${svgRightArrow()}</button>
                        </p>
                        `}
                        ${!spectrum.locked && spectrum.format == "sort" && html`
                        <p class="space-above">
                            <a class="button button-primary" href=${this.writeUrl()} target="_blank">Share your answers ${svgRightArrow()}</button>
                        </p>
                        `}
                        ${spectrum.locked && html`
                        <p class="help space-above">
                            <b>Why share?</b><br/>One reason why it's hard to talk about conspiracy theories is that we often rely on assumptions about what each other believe. <a href="https://twitter.com/hashtag/ConspiracySpectrums">#ConspiracySpectrums</a> save us guessing, and can lead to better conversations if we're all willing to share. 
                        </p>
                        <p class="space-above button-wrap">
                            <a href=${'/index.html?' + spectrum.id} class="button button-primary">Share your own answers</a>
                            <a href=${'/index.html'} class="button button-secondary">See other spectrums</a>
                        </p>
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

                <p class="contact">
                    Comments and ideas to <a target="_blank" href="https://twitter.com/eukras">@eukras</a> on Twitter
                </p>
            `}

            </div>
        `;
    }
};

const html = htm.bind(h);
render(html`<${App} />`, document.body);
