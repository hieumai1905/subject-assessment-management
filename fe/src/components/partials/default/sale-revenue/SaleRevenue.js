import React, { useState, useEffect } from "react";
import { CardTitle } from "reactstrap";
import { Icon, TooltipComponent } from "../../../Component";
import { BarChart } from "../../charts/default/Charts";
import authApi from "../../../../utils/ApiAuth";

const SaleRevenue = () => {
  const [totalClass, setTotalClass] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await authApi.get("/dashboard/admin");
        if (data.statusCode === 200) {
          setTotalClass(data.data.totalClass);
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
          <h6 className="title">Number of class</h6>
        </CardTitle>
        <div className="card-tools">
          <TooltipComponent
            icon="help-fill"
            iconClass="card-hint"
            direction="left"
            id="tooltip-1"
            text="Total number of classes in the last 30 days."
          />
        </div>
      </div>
      <div className="align-end gy-3 gx-5 flex-wrap flex-md-nowrap flex-lg-wrap flex-xxl-nowrap">
        <div className="nk-sale-data-group flex-md-nowrap g-4">
          <div className="nk-sale-data">
            <span className="amount">{totalClass}</span>
            <span className="sub-title">Total Classes</span>
          </div>
        </div>
        <div className="nk-sales-ck sales-revenue">
          <BarChart sales />
        </div>
      </div>
    </React.Fragment>
  );
};

export default SaleRevenue;
  