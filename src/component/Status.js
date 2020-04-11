import React from 'react';
import { PageHeader, Tag, Drawer, Button } from 'antd';
import { SoundOutlined, LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import Cast from '../assets/svg/cast';
import Telegram from '../assets/svg/telegram';
import Config from './Config';
import YoutubeSearch from './YoutubeSearch';

class Status extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDevices: false,
      configVisible: false,
      youtubeChannel: null,
      currentConfig: null,
      isLoadingDevice: false
    };
  }

  componentDidMount() {
    const { ipcRenderer } = window.require('electron');

    ipcRenderer.on(`set-youtube-channel`, (e, youtubeChannel) => {
      this.setState({
        youtubeChannel: youtubeChannel
      });
    });
  }

  showDevices() {
    this.setState({
      showDevices: true
    });
  }

  hideDevices() {
    this.setState({
      showDevices: false
    });
  }

  onDeviceSelect(device) {
    this.setState({
      isLoadingDevice: device.name
    });
    this.props.onSelectDevice(device);
  }

  onDisconnectDevice() {
    if (this.props.device) this.props.onDisconnectDevice();
  }

  onCloseConfig() {
    this.setState({
      configVisible: false
    });
  }

  onCloseYoutubeSearch() {
    this.setState({
      youtubeSearchVisible: false
    });
  }

  onConfigUpdate(config) {
    this.setState({
      currentConfig: config
    });
  }

  render() {
    return (
      <div>
        <Config
          visible={this.state.configVisible}
          onConfigUpdate={this.onConfigUpdate.bind(this)}
          onCloseConfig={this.onCloseConfig.bind(this)}
        />
        <YoutubeSearch
          visible={this.state.youtubeSearchVisible}
          onCloseYoutubeSearch={this.onCloseYoutubeSearch.bind(this)}
        />
        <Drawer
          title="Select Device"
          placement="right"
          closable={true}
          onClose={this.hideDevices.bind(this)}
          visible={this.state.showDevices}
        >
          {this.props.devices.map((el) => (
            <p
              key={el.name}
              style={{
                cursor:
                  this.props.device === null || (this.props.device && this.props.device.name === el.name)
                    ? 'pointer'
                    : null,
                color: this.props.device && this.props.device.name === el.name ? '#e91e63' : null
              }}
              onClick={() => {
                if (this.props.device && el.name === this.props.device.name) this.onDisconnectDevice();
                else if (this.props.device === null) this.onDeviceSelect(el);
              }}
            >
              {this.props.loadingDevice && this.state.isLoadingDevice === el.name ? (
                <LoadingOutlined style={{ marginRight: 10 }} />
              ) : null}
              {!this.props.loadingDevice && this.props.device && this.props.device.name === el.name ? (
                <SoundOutlined style={{ marginRight: 10 }} />
              ) : null}
              {el.friendlyName}
            </p>
          ))}
        </Drawer>
        <PageHeader
          title={'TeleTube Player'}
          tags={
            this.state.currentConfig != null && this.state.currentConfig.telegramBotTokenValid ? (
              <Tag color="green">Bot Running</Tag>
            ) : (
              <Tag color="red">Bot Stopped</Tag>
            )
          }
          extra={[
            <Button
              key={2}
              className="tt-btn"
              shape="circle"
              icon={<SearchOutlined />}
              onClick={() => {
                this.setState({ youtubeSearchVisible: true });
              }}
            />,
            <Button
              key={0}
              className="tt-btn"
              shape="circle"
              icon={<Telegram />}
              onClick={() => {
                this.setState({ configVisible: true });
              }}
            />,
            <Button
              key={1}
              className="tt-btn"
              disabled={this.props.devices.length < 1}
              shape="circle"
              icon={
                this.props.loadingDevice ? (
                  <LoadingOutlined />
                ) : (
                  <Cast
                    style={{
                      color: this.props.device ? '#e91e63' : null
                    }}
                  />
                )
              }
              style={{ border: 'none' }}
              onClick={this.showDevices.bind(this)}
            />
          ]}
        />
      </div>
    );
  }
}

export default Status;
