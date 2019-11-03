import React from 'react';
import { Table } from 'antd';
// import { Pagination } from 'antd';
import CONSTANT from 'utils/constant'

class AjaxTable extends React.Component {

    state = {
        data: [],
        pagination: {
            pageSize: this.props.pageSize || CONSTANT.PAGESIZE,
        },
        loading: false,
        sorter: {
            field: '',
            order: ''
        },
        params: {},
        filters: []
    };

    setParam(params) {
        this.state.params = params;
    }

    handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
            filters: filters,
            sorter: sorter
        }, function () {
            this.getData();
        });
    }
    handlePageChange(page, pageSize) {
        const pager = { ...this.state.pagination };
        pager.current = page;
        pager.pageSize = pageSize;
        this.setState({
            pagination: pager,
        }, function () {
            this.getData();
        });
    }
    componentDidMount() {
        this.initTable();
    }

    initTable() {
        this.setState({
            pagination: {
                pageSize: this.state.pagination.pageSize,
                current: 1,
            }
        }, function () {
            this.getData();
        })
    }
    renderData(obj) {
        this.setState(obj);
    }

    getData() {
        let that = this;
        this.setState({ loading: true });
        this.props.getData({
            pageSize: that.state.pagination.pageSize,
            pageNum: that.state.pagination.current,
            ...this.state.params,
            sortField: that.state.sorter.field,
            sortOrder: that.state.sorter.order,
            ...that.state.filters,
        }, function (data) {
            const pagination = { ...that.state.pagination };
            pagination.total = data.total;
            if (that.props.onPaginationChange) {
                that.props.onPaginationChange(pagination)
            }
            that.renderData({
                loading: false,
                data: data.list,
                pagination,
            })
        });
    }

    getPagination() {
        return this.state.pagination
    }

    onShowSizeChange(current, pageSize) {
    }

    render() {
        let that = this, rowSelection,expandedRowRender, { pagination } = this.state;
        if (this.props.rowSelection) {
            rowSelection = {
                onChange: (selectedRowKeys, selectedRows) => {
                    that.props.onItemSelected(selectedRowKeys, selectedRows);
                },
                selectedRowKeys: this.props.selectedRowKeys,
            };
        }
        return (
            (this.state.data.length == 0 && this.props.placeholder && !this.state.loading) ?
                <div>
                    <Table className="empty"
                        columns={this.props.columns} />
                    {this.props.placeholder}
                </div> : <Table
                    columns={this.props.columns}
                    rowKey={record => { return record[that.props.keyField] }}
                    dataSource={this.state.data}
                    rowSelection={rowSelection ? rowSelection : null}
                    expandedRowRender={this.props.expandedRowRender||null}
                    expandRowByClick={this.props.expandRowByClick}
                    pagination={false}
                    loading={this.state.loading}
                    onChange={this.handleTableChange}
                    /**
                     * 
                    footer={() => (
                        that.state.pagination ?
                            <div>
                                {this.props.tablectrl}
                                <div style={{ textAlign: 'right' }}>
                                    <div className="ajax-table-footer">
                                        <span style={{ position: 'relative', top: '-10px', marginRight: '12px' }}>总计{this.state.pagination.total}条</span>
                                        <Pagination style={{ display: 'inline-block' }} pageSizeOptions={['10', '20', '30', '50', '100']}
                                            pageSize={CONSTANT.PAGESIZE}
                                            showSizeChanger onChange={that.handlePageChange.bind(that)} showQuickJumper
                                            onShowSizeChange={that.handlePageChange.bind(that)}
                                            current={pagination.current} total={pagination.total} />
                                    </div>
                                </div>
                            </div> : ''
                    )}
                     */
                />
        );
    }
}

export default AjaxTable;