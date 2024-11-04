import React, { useState, useEffect } from "react";
import { CardTitle } from "reactstrap";
import { Icon, TooltipComponent } from "../../../Component";
import { BarChart } from "../../charts/default/Charts";
import authApi from "../../../../utils/ApiAuth";

const AvgSubscription = () => {
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await authApi.get("/dashboard/admin");
        if (data.statusCode === 200) {
          const studentClasses = data.data.studentClasses;
          const total = studentClasses.reduce((acc, currentClass) => acc + currentClass.totalStudent, 0);
          setTotalStudents(total);
        } else {
          console.error("Failed to fetch data:", data.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <React.Fragment>
      <div className="card-title-group align-start mb-2">
        <CardTitle>
          <h6 className="title">Number of students</h6>
        </CardTitle>
        <div className="card-tools">
       
        </div>
      </div>
      <div className="align-end flex-sm-wrap g-4 flex-md-nowrap">
        <div className="nk-sale-data">
          <span className="amount">{totalStudents}</span>
          {/* <span className="sub-title">
            <span className="change up text-success">
              <Icon name="arrow-long-up" />
              2.45%
            </span>
            since last week
          </span> */}
        </div>
        <div className="nk-sales-ck">
          <BarChart />
        </div>
      </div>
    </React.Fragment>
  );
};

export default AvgSubscription;
