export class Song {
  constructor() {
    this.attrs = {};
    this.sections = [];
  }

  // toHtml() {
  //   let sectionHtml = this.sections.map((section, index) => <div className="section" key={'section' + index}>
  //     <div className="name">{section.name}</div>
  //     <div className="lines">
  //       { section.lines.map((line) => <div className="line">
  //           { line.parts.map((part) => <div className="part">
  //               <div className="chord">{part.chord}</div>
  //               <div className="lyric">{part.lyric}</div>
  //             </div>
  //           )}
  //         </div>
  //       )}
  //     </div>
  //   </div>);
  //
  //   return <div>
  //     <h1>{this.attrs['title']}</h1>
  //     <h2>{this.attrs['artist']}</h2>
  //     <div className="sections">
  //       { sectionHtml }
  //     </div>
  //   </div>;
  // }
}