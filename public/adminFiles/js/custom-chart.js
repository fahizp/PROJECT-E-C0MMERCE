let  temp
let priceday = [];
(async function ($) {
    fetch('/admin_panel/chartGraph', {
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(res=>res.json()).then((res)=>{


         /*Sale statistics Chart*/
    if ($('#myChart').length) {
        var ctx = document.getElementById('myChart').getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',
            
            // The data for our dataset
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                        label: 'Sales',
                        tension: 0.3,
                        fill: true,
                        backgroundColor: 'rgba(44, 120, 220, 0.2)',
                        borderColor: 'rgba(44, 120, 220)',
                        data: [res.data[1].total,res.data[1].total,res.data[3].total,res.data[4].total,res.data[5].total,res.data[6].total,res.data[7].total,res.data[8].total,res.data[9].total,res.data[10].total,res.data[11].total,res.data[12].total]
                    },
                ]
            },
            options: {
                plugins: {
                legend: {
                    labels: {
                    usePointStyle: true,
                    },
                }
                }
            }
        });
    } //End if
      })


      fetch('/admin_panel/orderDataAdminYearly?month='+12+'&year='+new Date().getFullYear(), {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        }
      }).then(res => res.json())
      .then((res) => {
        let price = res.arr3
        for(i=2017;i<price.length;i++){
          if(price[i]==undefined){
            price[i]=0
          }else{
            price[i]
          }
        }
          if ($('#myChart3').length) {
            var ctx = document.getElementById('myChart3').getContext('2d');
            var chart = new Chart(ctx, {
                // The type of chart we want to create
                type: 'line',
                
                // The data for our dataset
                data: {
                    labels: [2017,2018,2019,2020,2021,2022,2023],
                    datasets: [{
                            label: 'Sales',
                            tension: 0.3,
                            fill: true,
                            backgroundColor: 'rgba(44, 120, 220, 0.2)',
                            borderColor: 'rgb(4, 209, 130)',
                            data: [price[2017],price[2018],price[2019],price[2020],price[2021],price[2022]]
                        },
                       
    
                    ]
                },
                options: {
                    plugins: {
                    legend: {
                        labels: {
                        usePointStyle: true,
                        },
                    }
                    }
                }
            });
        } //End if
        })

        let month = parseInt(new Date().getMonth())+1
          fetch('/admin_panel/orderDataAdminDaily?month='+12+'&year='+new Date().getFullYear(), {
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
            }
          }).then(res => res.json())
            .then((res) => {
              for(i=1;i<=30;i++){
                for(j=0;j<=30;j++){
                  if(res[j]?._id == i){
                    priceday[i] = res[j]?.totalCount
                    break;
                  }else{
                    priceday[i] = 0
                  }   
                } 
              }


              if ($('#myChart4').length) {
                var ctx = document.getElementById('myChart4').getContext('2d');
                const monthToreadable = (date)=>{
                    let month = ['Jan','Feb','March','April','May','June','July','Aug','Sept','Nov','Dec']
                    let mm = date.getMonth()-1;
                    let monthText = month[mm]
                    return(monthText)
                }
                var chart = new Chart(ctx, {
                    // The type of chart we want to create
                    type: 'line',
                    
                    // The data for our dataset
                    data: {
                        labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],
                        datasets: [{
                                label: 'Sales',
                                tension: 0.3,
                                fill: true,
                                backgroundColor: 'rgba(44, 120, 220, 0.2)',
                                borderColor: 'rgb(94, 114, 228)',
                                data: [priceday[1],priceday[2],priceday[3],priceday[4],priceday[5],priceday[6],priceday[7],priceday[8],priceday[9],priceday[10],priceday[11],priceday[12],priceday[13],priceday[14],priceday[15],priceday[16],priceday[17],priceday[18]
                                ,priceday[19],priceday[20],priceday[21],priceday[22],priceday[23],priceday[24],priceday[25],priceday[26],priceday[27],priceday[28],priceday[29],priceday[30]]
                            },
                            
        
                        ]
                    },
                    options: {
                        plugins: {
                        legend: {
                            labels: {
                            usePointStyle: true,
                            },
                        }
                        }
                    }
                });
            } //End if
            })





      
      



    "use strict";

   

    /*Sale statistics Chart*/
    if ($('#myChart2').length) {
        var ctx = document.getElementById("myChart2");
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
            labels: ["900", "1200", "1400", "1600"],
            datasets: [
                {
                    label: "US",
                    backgroundColor: "#5897fb",
                    barThickness:10,
                    data: [233,321,783,900]
                }, 
                {
                    label: "Europe",
                    backgroundColor: "#7bcf86",
                    barThickness:10,
                    data: [408,547,675,734]
                },
                {
                    label: "Asian",
                    backgroundColor: "#ff9076",
                    barThickness:10,
                    data: [208,447,575,634]
                },
                {
                    label: "Africa",
                    backgroundColor: "#d595e5",
                    barThickness:10,
                    data: [123,345,122,302]
                },
            ]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                        usePointStyle: true,
                        },
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } //end if
    
})(jQuery);