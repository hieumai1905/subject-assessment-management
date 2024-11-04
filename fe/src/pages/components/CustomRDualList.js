import React, { useEffect, useState } from "react";
import DualListBox from "react-dual-listbox";
import { Button, Icon } from "../../components/Component";
import { ButtonGroup } from "reactstrap";

const buttonText = {
  moveLeft: <span className="dual-listbox__button">Remove</span>,
  moveAllLeft: <span className="dual-listbox__button">Remove all</span>,
  moveRight: <span className="dual-listbox__button">Add</span>,
  moveAllRight: <span className="dual-listbox__button">Add all</span>,
  moveDown: <span className="fa fa-chevron-down" />,
  moveUp: <span className="fa fa-chevron-up" />,
  moveTop: <span className="fa fa-double-angle-up" />,
  moveBottom: <span className="fa fa-double-angle-down" />,
};

const buttonIcon = {
  moveLeft: (
    <span className="dual-listbox__button">
      <Icon name="chevron-left" />
    </span>
  ),
  moveAllLeft: (
    <span className="dual-listbox__button">
      <Icon name="chevrons-left" />
    </span>
  ),
  moveRight: (
    <span className="dual-listbox__button">
      <Icon name="chevron-right" />
    </span>
  ),
  moveAllRight: (
    <span className="dual-listbox__button">
      <Icon name="chevrons-right" />
    </span>
  ),
  moveDown: <span className="fa fa-chevron-down" />,
  moveUp: <span className="fa fa-chevron-up" />,
  moveTop: <span className="fa fa-double-angle-up" />,
  moveBottom: <span className="fa fa-double-angle-down" />,
};

const CustomReactDualList = ({
  data,
  setData,
  selected,
  setSelected,
  options,
  icon,
  canFilter,
  handleSaveChanges,
  filterText,
  setFilterText,
  handleFilter,
}) => {
  const onListChange = (selected) => {
    setSelected(selected);
  };

  return (
    <div className="dual-listbox p-5">
      <div className="row">
        <div className="col-md-7 col-sm-7">
          {canFilter && (
            <ButtonGroup size="xxl" className="w-65">
              <input className="dual-listbox__search" placeholder="teacher name or username" onChange={(e) => setFilterText(e.target.value)} />
              <Button onClick={() => handleFilter()} color="primary">Search</Button>
            </ButtonGroup>
          )}
        </div>
        <div className="col-md-5 col-sm-5">
          <Button onClick={() => handleSaveChanges()} color="primary">
            Save Changes
          </Button>
        </div>
      </div>

      <DualListBox
        options={data}
        selected={selected}
        icons={icon ? buttonIcon : buttonText}
        onChange={onListChange}
        showHeaderLabels={true}
      ></DualListBox>
    </div>
  );
};

export default CustomReactDualList;
