const { combineReducers, createStore } = Redux;
var comp_playlist_ptr=null;
var comp_ext_window_ptr=null;
let playlist_store = createStore(playlist_functions);
// Action creators
function ac_delete_id(index) {
    return {
        type: 'DELETEID',
        index: index
    }
}
function ac_add_text(text) {
    return {
        type: 'ADDTEXT',
        text: text
    }
}
function playlist_functions(playlist=[], action) {
    switch(action.type) {
    case 'ADDTEXT':
        playlist.push(action.text);
        break;
    case 'DELETEID':
        playlist.splice(action.index,1);
        break;
    }
    return playlist
}
function subscriber() {
    if (comp_playlist_ptr != null) {
        comp_playlist_ptr.forceUpdate();
    }
    if (comp_ext_window_ptr != null) {
        comp_ext_window_ptr.setState({item_count:playlist_store.getState().length});
    }
}

class Playlist extends React.Component {
    constructor(props) {
        super(props);
        comp_playlist_ptr=this;
    }
    renderItem(i) {
        return <PlaylistItem title={playlist_store.getState()[i]} clickHandler={()=>playlist_store.dispatch(ac_delete_id(i))} />;
    }
    render() {
        var render_items=Array();
        var playlist_items=playlist_store.getState();
        for (var i=0;i<playlist_items.length;i++) {
            render_items[i]=this.renderItem(i);
        }
        return (
            <table>
                {render_items}
            </table>
        );
    }
}
class MainWindow extends React.Component {
    constructor(props) {
        super(props);
        this.toggle_external=this.toggle_external.bind(this);
        this.state={
            ext_open:false
        }
    }
    toggle_external() {
        this.setState({ext_open: !this.state.ext_open});
    }
    render() {
        var ext_render=null;
        if(this.state.ext_open) {
            ext_render=(
            <ExtWindow initial_count={playlist_store.getState().length} />
        )}

        return (
            <div>
            <Adder />
            <Playlist />
            <button onClick={this.toggle_external}>
                {this.state.ext_open ? 'Close external' : 'Show external'}
            </button>
            {ext_render}
            </div>
        );
    }
}
class ExtWindow extends React.Component {
    constructor(props) {
        super(props);
        this.new_child=document.createElement('div');
        this.new_window=null;
        this.state={
            item_count:this.props.initial_count
        }
        comp_ext_window_ptr=this;
    }
    componentDidMount() {
        this.new_window=window.open();
        this.new_window.document.body.appendChild(this.new_child);
    }
    componentWillUnmount() {
        this.new_window.close();
        comp_ext_window_ptr=null;
    }
    render() {
        return ReactDOM.createPortal(
            (
            <div>
            Main window contains {this.state.item_count} Items.
            </div>
            ), this.new_child
        );
    }
}

class Adder extends React.Component {
    render() {
        return (
            <button onClick={()=>playlist_store.dispatch(ac_add_text('Generated Item'))}>Button</button>
        );
    }
}
class PlaylistItem extends React.Component {
    render() {
        return (
            <tr><td>{this.props.title}</td><td onClick={()=>this.props.clickHandler()}>DEL</td></tr>
        );
    }
}
playlist_store.subscribe(subscriber.bind(playlist_store));
playlist_store.dispatch(ac_add_text("Item 1"));
playlist_store.dispatch(ac_add_text("Item 2"));
playlist_store.dispatch(ac_add_text("Item 3"));
ReactDOM.render(
    <MainWindow />,
    document.getElementById('root')
);
