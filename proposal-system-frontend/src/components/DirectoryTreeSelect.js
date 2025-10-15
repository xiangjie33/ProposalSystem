import { TreeSelect } from 'antd';
import { FolderOutlined } from '@ant-design/icons';

const DirectoryTreeSelect = ({ value, onChange, directories, placeholder }) => {
  // 递归构建树形数据
  const buildTreeData = (dirs) => {
    return dirs.map(dir => ({
      title: dir.name,
      value: dir.id,
      key: dir.id,
      icon: <FolderOutlined />,
      children: dir.children && dir.children.length > 0 ? buildTreeData(dir.children) : undefined,
    }));
  };

  const treeData = buildTreeData(directories);

  return (
    <TreeSelect
      value={value}
      onChange={onChange}
      treeData={treeData}
      placeholder={placeholder || '请选择目录'}
      multiple
      treeCheckable
      showCheckedStrategy={TreeSelect.SHOW_ALL}
      treeDefaultExpandAll
      style={{ width: '100%' }}
      maxTagCount={3}
      showSearch
      treeNodeFilterProp="title"
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
    />
  );
};

export default DirectoryTreeSelect;
