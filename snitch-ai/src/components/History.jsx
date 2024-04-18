import React, { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/database';

const ReportTable = () => {
  const [userReports, setUserReports] = useState([]);

  useEffect(() => {
    fetchUserReports();
  }, []);

  const fetchUserReports = () => {
    const userId = firebase.auth().currentUser.uid;
    const reportsRef = firebase.database().ref('reports');
    const userReportsQuery = reportsRef.orderByChild('userId').equalTo(userId);

    userReportsQuery.on('value', (snapshot) => {
      const reports = [];
      snapshot.forEach((childSnapshot) => {
        const report = childSnapshot.val();
        reports.push(report);
      });
      setUserReports(reports);
    });
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Metric 1</th>
          <th>Metric 2</th>
          {/* Add more table headers for each metric */}
        </tr>
      </thead>
      <tbody>
        {userReports.map((report, index) => (
          <tr key={index}>
            <td>{new Date(report.timestamp).toLocaleString()}</td>
            <td>{report.metrics.metric1}</td>
            <td>{report.metrics.metric2}</td>
            {/* Add more table cells for each metric */}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ReportTable;