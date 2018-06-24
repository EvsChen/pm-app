import React from 'react';
import { Layout, Card, Icon, Avatar, Select } from 'antd';
import './Home.css';

const { Header, Content } = Layout;
const { Meta } = Card;
const Option = Select.Option;

function handleChange(value) {
    console.log(`selected ${value}`);
}

class Index extends React.Component {
    render() {
        return (
            <React.Fragment>
                <Header style={{ background: '#fff', padding: 0 }}>
                    <Select defaultValue="lucy" style={{ width: 120 }} onChange={handleChange}>
                        <Option value="jack">Today</Option>
                        <Option value="lucy">This Week</Option>
                        <Option value="disabled" disabled>This Month</Option>
                    </Select>
                </Header>
                <Content style={{ margin: '0 16px' }}>
                    <Card
                        actions={[<Icon type="setting" />, <Icon type="edit" />, <Icon type="ellipsis" />]}
                    >
                        <Meta
                            avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                            title="Meeting with Elvis"
                            description={<p>Due: Today </p>}
                        />
                    </Card>
                    <Card
                        actions={[<Icon type="setting" />, <Icon type="edit" />, <Icon type="ellipsis" />]}
                    >
                        <Meta
                            avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                            title="Dinner with Max"
                            description={<p>Due:Tomorrow </p>}
                        />
                    </Card>
                </Content>
            </React.Fragment>
        );
    }
}

export default Index;