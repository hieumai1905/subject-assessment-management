import React, { useEffect, useState } from "react";
import Head from "../../layout/head/Head";
import Content from "../../layout/content/Content";
import {
  Block,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  BlockDes,
  BackTo,
  PreviewCard,
  Icon,
  BlockBetween,
  Button,
} from "../../components/Component";
import CustomReactDualList from "../components/CustomRDualList";
import { toast } from "react-toastify";
import authApi from "../../utils/ApiAuth";
import { transformToOptions } from "../../utils/Utils";

export default function SubjectTeachers({ subject }) {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const fetchUsers = async () => {
    try {
      const response = await authApi.post("/user/search", {
        pageSize: 9999,
        roleName: "teacher",
        keyWord: filterText
      });
      console.log("teachers: ", response.data.data);
      if (response.data.statusCode === 200) {
        setUsers(transformToOptions(response.data.data.users));
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("fetch teachers:", error);
      toast.error(`${error}`, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };
  const fetchExistedTeachers = async () => {
    try {
      const response = await authApi.post("/subjects/search-subject-teachers", {
        pageSize: 9999,
        subjectId: subject?.id,
        type:"added"
      });
      console.log("selected teachers: ", response.data.data);
      if (response.data.statusCode === 200) {
        const ids = response?.data?.data?.map(item => item.id);
        setSelected(ids);
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("fetch selected teachers:", error);
      toast.error(`${error}`, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }
  useEffect(() => {
    fetchUsers();
    fetchExistedTeachers();
  }, []);
  const [selected, setSelected] = useState([]);
  const [filterText, setFilterText] = useState("");

  const handleSaveChanges = async () => {
    console.log('selected: ', selected);
    try {
      const response = await authApi.put("/subjects/update-subject-teacher", {
        subjectId: subject?.id,
        teacherIds: selected
      });
      console.log("update teachers: ", response.data.data);
      if (response.data.statusCode === 200) {
        toast.success(`Update subject teacher successfully!`, {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("update teachers:", error);
      toast.error(`${error}`, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  const handleFilter = () => {
    fetchUsers();
  }
  return (
    <>
      <Head title="Duallistbox"></Head>
      <Content page="component">
        <Block size="lg">
          <PreviewCard>
            <CustomReactDualList
              data={users}
              options={users}
              setData={setData}
              selected={selected}
              setSelected={setSelected}
              canFilter={true}
              handleSaveChanges={handleSaveChanges}
              filterText={filterText}
              setFilterText={setFilterText}
              handleFilter={handleFilter}
            />
          </PreviewCard>
        </Block>
      </Content>
    </>
  );
}
