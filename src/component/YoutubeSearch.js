import React from 'react';
import { List, Input, Button, Drawer, Menu, Typography, Dropdown, Empty, Row, Col } from 'antd';
import { DeleteFilled, CaretRightOutlined, MoreOutlined } from '@ant-design/icons';

const { Search } = Input;

class YoutubeSearch extends React.Component {

    menu = (item) => (
        <Menu>
            <Menu.Item
                key={0}
                onClick={() => {
                    console.log(item);
                }}
            >
                <DeleteFilled />
                Delete
            </Menu.Item>
        </Menu>
    );

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            query: null,
            youtubeLoading: false,
            youtubeLoadingNext: false,
            youtubeLoadingPrev: false,
            youtubeError: null,
            searchData: null,
            searchResult: []
        };
    }

    componentDidMount() {
        const { ipcRenderer } = window.require('electron');
        
        ipcRenderer.on(`ui-youtube-search-result`, (e, results, searchData) => {
            this.setState({
                searchData: searchData, 
                searchResult: results, 
                youtubeLoadingPrev: false,
                youtubeLoadingNext: false,
                youtubeLoading: false,
                youtubeError: null
            });
        })

        ipcRenderer.on(`ui-youtube-search-error`, (e, message) => {
            this.setState({
                searchResult: [], 
                youtubeLoading: false,
                youtubeLoadingNext: false,
                youtubeLoadingPrev: false,
                youtubeError: message
            });
        })
    }

    onSearch = query => {
        const { ipcRenderer } = window.require('electron');
        if (query !== '') {
            this.setState({youtubeLoading: true})
            ipcRenderer.send(`ui-search-youtube`, query);
        } else {
            this.setState({
                searchData: null,
                searchResult: [], 
                youtubeLoading: false,
                youtubeError: 'Search something'
            });
        }
    }

    onPageChange(pageToken, query) {
        const { ipcRenderer } = window.require('electron');
        if (query !== '') {
            this.setState({ youtubeLoading: true })
            ipcRenderer.send(`ui-search-page-youtube`, query, pageToken);
        } else {
            this.setState({
                searchResult: [], 
                youtubeLoading: false,
                youtubeError: 'Search something'
            });
        }
    }

    render() {

        let footer = this.state.searchData === null ? null : <div>
            {this.state.searchData.prevPageToken ? <Button loading={this.state.youtubeLoadingPrev} disabled={this.state.youtubeLoading} onClick={() => {
                this.setState({youtubeLoadingPrev: true});
                this.onPageChange(this.state.searchData.prevPageToken, this.state.searchData.query)
            }}>Previous Page</Button> : null }
            {this.state.searchData.nextPageToken ? <Button 
                style={{float: 'right'}}
                loading={this.state.youtubeLoadingNext} disabled={this.state.youtubeLoading} onClick={() => {
                this.setState({youtubeLoadingNext: true});
                this.onPageChange(this.state.searchData.nextPageToken, this.state.searchData.query)
            }}>Next Page</Button> : null }
        </div>

        return (
            <Drawer
                placement="left"
                title="Search on Youtube"
                width={500}
                closable={true}
                onClose={this.props.onCloseYoutubeSearch}
                footer={footer}
                visible={this.props.visible}
            >
                <Row>
                    <Col span={24}>
                    <Search
                        placeholder="Search"
                        disabled={this.state.youtubeLoading}
                        loading={this.state.youtubeLoading}
                        onSearch={this.onSearch.bind(this)}
                        style={{ width: '100%' }}
                    />
                    </Col>
                </Row>
                <Row style={{
                    marginLeft: -14,
                    marginRight: -24,
                    marginBottom: -24,
                    marginTop: 10,
                }}>
                    <Col span={24}>
                {this.state.searchResult.length > 0 ? (
                    <List
                            style={{
                                overflowY: 'auto',
                                height: 'calc(100vh - 174px)',
                                maxHeight: 'calc(100vh - 174px)',
                                minHeight: 'calc(100vh - 174px)'
                            }}
                        >
                            {this.state.searchResult.map(item =>
                                    <List.Item
                                        key={item.uid}
                                        className="tt-playlist-song"
                                        style={{ justifyContent: 'space-between' }}
                                    >
                                        <div style={{ width: 'calc(100% - 60px)' }}>
                                            <img
                                                alt=""
                                                src={item.thumbnails.medium.url}
                                                onClick={() => {
                                                    console.log(item);
                                                }}
                                                style={{
                                                    cursor: 'pointer',
                                                    width: 60,
                                                    marginRight: 20
                                                }}
                                            />
                                            <Typography.Text
                                                style={{
                                                    maxWidth: 'calc(100% - 90px)',
                                                    verticalAlign: 'middle'
                                                }}
                                                ellipsis
                                            >
                                                {item.title}
                                            </Typography.Text>
                                        </div>
                                        <div>
                                            <>
                                                <Button
                                                    shape="circle"
                                                    size="small"
                                                    className="tt-btn"
                                                    icon={<CaretRightOutlined />}
                                                    style={{ border: 'none' }}
                                                    onClick={() => {
                                                        console.log(item);
                                                    }}
                                                />
                                                <Dropdown overlay={this.menu(item)}>
                                                    <Button
                                                        className="tt-btn"
                                                        size={'small'}
                                                        icon={<MoreOutlined />}
                                                        type={'link'}
                                                    />
                                                </Dropdown>
                                            </>
                                        </div>
                                    </List.Item>
                            )}
                        </List>
                ) : (
                    <Row justify="space-around" align="middle" style={{ height: 'calc(100vh - 178px)' }}>
                        <Col>
                            <Empty description={this.state.youtubeError === null ? 'Search Something' : this.state.youtubeError} />
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
