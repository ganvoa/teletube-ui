import React from "react";
import { List, Input, Button, Drawer, Typography, Empty, Row, Col, message, Badge } from "antd";
import { PlusOutlined, CaretRightOutlined } from "@ant-design/icons";

const { Search } = Input;

class YoutubeSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            query: null,
            youtubeLoading: false,
            youtubeError: null,
            searchResult: [],
            loadingItems: [],
            loadingItemsPlay: [],
        };
    }

    componentDidMount() {
        const { ipcRenderer } = window.require("electron");

        ipcRenderer.on(`ui-youtube-search-result`, (e, results) => {
            this.setState({
                searchResult: results,
                youtubeLoading: false,
                youtubeError: null,
                loadingItems: [],
                loadingItemsPlay: [],
            });
        });

        ipcRenderer.on(`ui-youtube-search-error`, (e, message) => {
            this.setState({
                searchResult: [],
                youtubeLoading: false,
                youtubeLoadingNext: false,
                youtubeLoadingPrev: false,
                youtubeError: message,
                loadingItems: [],
                loadingItemsPlay: [],
            });
        });

        ipcRenderer.on(`ui-add-song-error`, (e, song, msg) => {
            this.setState({
                loadingItems: this.state.loadingItems.filter(it => it !== song.id)
            });
            message.error(msg);
        });

        ipcRenderer.on(`ui-add-play-song-error`, (e, song, msg) => {
            this.setState({
                loadingItemsPlay: this.state.loadingItemsPlay.filter(it => it !== song.id)
            });
            message.error(msg);
        });

        ipcRenderer.on(`ui-add-song-success`, (e, song) => {
            this.setState({
                loadingItems: this.state.loadingItems.filter(it => it !== song.id)
            });
            message.success("Song added!");
        });

        ipcRenderer.on(`ui-add-play-song-success`, (e, song) => {
            this.setState({
                loadingItemsPlay: this.state.loadingItemsPlay.filter(it => it !== song.id)
            });
            message.success("Song added!");
        });
    }

    onSearch = query => {
        const { ipcRenderer } = window.require("electron");
        if (query !== "") {
            this.setState({ youtubeLoading: true });
            ipcRenderer.send(`ui-search-youtube`, query);
        } else {
            this.setState({
                searchResult: [],
                loadingItems: [],
                loadingItemsPlay: [],
                youtubeLoading: false,
                youtubeError: "Search something"
            });
        }
    };

    addSong(song) {
        this.setState({
            loadingItems: [song.id, ...this.state.loadingItems]
        });
        const { ipcRenderer } = window.require("electron");
        ipcRenderer.send(`ui-add-song`, song);
    }

    addPlaySong(song) {
        this.setState({
            loadingItemsPlay: [song.id, ...this.state.loadingItemsPlay]
        });
        const { ipcRenderer } = window.require("electron");
        ipcRenderer.send(`ui-add-play-song`, song);
    }

    render() {
        return (
            <Drawer
                placement="left"
                title="Search on Youtube"
                width={600}
                closable={true}
                onClose={this.props.onCloseYoutubeSearch}
                visible={this.props.visible}
            >
                <Row>
                    <Col span={24}>
                        <Search
                            placeholder="Search"
                            disabled={this.state.youtubeLoading}
                            loading={this.state.youtubeLoading}
                            onSearch={this.onSearch.bind(this)}
                            style={{ width: "100%" }}
                        />
                    </Col>
                </Row>
                <Row
                    style={{
                        marginLeft: -14,
                        marginRight: -24,
                        marginBottom: -24,
                        marginTop: 10
                    }}
                >
                    <Col span={24}>
                        {this.state.searchResult.length > 0 ? (
                            <List
                                style={{
                                    overflowY: "auto",
                                    height: "calc(100vh - 121px)",
                                    maxHeight: "calc(100vh - 121px)",
                                    minHeight: "calc(100vh - 121px)"
                                }}
                            >
                                {this.state.searchResult.map(item => (
                                    <List.Item
                                        key={item.id}
                                        className="tt-playlist-song"
                                        style={{ justifyContent: "space-between" }}
                                    >
                                        <div style={{ width: "calc(100% - 75px)" }}>
                                            <img
                                                alt=""
                                                src={item.image}
                                                onClick={() => {
                                                    console.log(item);
                                                }}
                                                style={{
                                                    cursor: "pointer",
                                                    width: 90,
                                                    marginRight: 10
                                                }}
                                            />
                                            <div style={{
                                                        maxWidth: "calc(100% - 112px)",
                                                        verticalAlign: "top",
                                                        display: 'inline-grid'
                                                    }}>
                                                <Typography.Text ellipsis>
                                                    {item.title}
                                                </Typography.Text>
                                                <Typography.Text type={"secondary"} ellipsis size={12}>
                                                    {item.description}
                                                </Typography.Text>
                                                <Typography.Text ellipsis>
                                                    <Badge count={item.time} style={{ borderRadius: '10%', backgroundColor: '#aaa' }} /> {item.ago}  
                                                </Typography.Text>
                                            </div>
                                        </div>
                                        <div>
                                            <>
                                                <Button
                                                    key={1}
                                                    shape="circle"
                                                    size="small"
                                                    disabled={this.state.loadingItemsPlay.includes(item.id)}
                                                    loading={this.state.loadingItems.includes(item.id)}
                                                    className="tt-btn"
                                                    icon={<PlusOutlined />}
                                                    style={{ border: "none" }}
                                                    onClick={() => {
                                                        this.addSong(item);
                                                    }}
                                                />
                                                <Button
                                                    key={2}
                                                    shape="circle"
                                                    size="small"
                                                    disabled={this.state.loadingItems.includes(item.id)}
                                                    loading={this.state.loadingItemsPlay.includes(item.id)}
                                                    className="tt-btn"
                                                    icon={<CaretRightOutlined />}
                                                    style={{ border: "none" }}
                                                    onClick={() => {
                                                        this.addPlaySong(item);
                                                    }}
                                                />
                                            </>
                                        </div>
                                    </List.Item>
                                ))}
                            </List>
                        ) : (
                            <Row justify="space-around" align="middle" style={{ height: "calc(100vh - 178px)" }}>
                                <Col>
                                    <Empty
                                        description={
                                            this.state.youtubeError === null
                                                ? "Search Something"
                                                : this.state.youtubeError
                                        }
                                    />
                                </Col>
                            </Row>
                        )}
                    </Col>
                </Row>
            </Drawer>
        );
    }
}

export default YoutubeSearch;
