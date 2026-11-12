

(function () {
'use strict';
const GROUND = 420, H = 540;
const MAN =  {"cafe":{"kit":1,"kind":"bldg","layer":"near","foot":1155.0,"walls":[[0.0,-882.0,1155.0,882.0,"#C3CEAE","#565C7F",0.0,63.0,"#E3D8B6","#897C8F","#7A809C","#3C4060"]],"atlas":[1310.0,470.0],"pieces":[[-42.0,-525.0,1239.0,91.0,267.5,413.38,520.38,38.22],[98.0,-532.0,966.0,154.0,267.5,255.38,966.0,154.0],[28.0,-420.0,560.0,427.0,466.8,4.0,252.0,192.15],[595.0,-455.0,238.0,462.0,4.0,4.0,238.0,462.0],[833.0,-392.0,315.0,399.0,267.5,4.0,195.3,247.38],[7.0,-812.0,35.0,819.0,246.0,4.0,17.5,409.5],[525.0,-105.0,91.0,112.0,1237.5,4.0,63.7,78.4]],"uatlas":[613.5,173.0],"upieces":[[-28.0,-966.0,1211.0,112.0,4.0,113.0,605.5,56.0],[49.0,-826.0,1022.0,210.0,4.0,4.0,511.0,105.0]],"spill":[[304.5,525.0,"#FFC46E",0.9],[976.5,245.0,"#FFC46E",0.7],[350.0,455.0,"#FF6A8C",0.45]],"neon":[{"f":"cafe.neon-cafe.svg","box":[105.0,-532.0,385.0,147.0],"color":"#FF6A8C","on":0.42},{"f":"cafe.neon-cup.svg","box":[833.0,-525.0,217.0,133.0],"color":"#63E6E2","on":0.5}]},"lavanderia":{"kit":1,"kind":"bldg","layer":"near","foot":1330.0,"walls":[[0.0,-840.0,1330.0,840.0,"#F3B891","#6C5269",77.0,56.0,"#FACBA1","#A47178","#987282","#4C394D"]],"atlas":[1118.0,470.0],"pieces":[[-28.0,-525.0,1386.0,77.0,327.5,362.0,582.12,32.34],[238.0,-518.0,854.0,133.0,250.0,225.0,854.0,133.0],[56.0,-427.0,231.0,434.0,250.0,4.0,115.5,217.0],[301.0,-420.0,770.0,427.0,369.5,4.0,346.5,192.15],[1071.0,-455.0,224.0,462.0,4.0,4.0,224.0,462.0],[966.0,-301.0,105.0,98.0,250.0,362.0,73.5,68.6],[21.0,-833.0,28.0,840.0,232.0,4.0,14.0,420.0]],"uatlas":[788.4,106.0],"upieces":[[1155.0,-1050.0,147.0,196.0,694.0,4.0,73.5,98.0],[-21.0,-875.0,1372.0,196.0,4.0,4.0,686.0,98.0]],"spill":[[686.0,721.0,"#CFF2EE",0.9],[665.0,840.0,"#48E0DC",0.4]],"neon":[{"f":"lavanderia.neon-lav.svg","box":[245.0,-511.0,840.0,119.0],"color":"#48E0DC","on":0.46},{"f":"lavanderia.neon-open.svg","box":[917.5,-342.5,217.5,144.2],"color":"#FF4A5A","on":0.4}]},"botanica":{"kit":1,"kind":"bldg","layer":"near","foot":826.0,"walls":[[0.0,-833.0,826.0,833.0,"#D7B7C2","#5F528C",0.0,0.0,"#ECCAC4","#94709E","#8672AD","#43396B"]],"atlas":[834.0,710.8],"pieces":[[14.0,-574.0,574.0,87.5,4.0,670.0,241.08,36.75],[14.0,-493.5,574.0,136.5,225.0,219.05,574.0,136.5],[35.0,-462.0,525.0,469.0,225.0,4.0,236.25,211.05],[581.0,-595.0,217.0,602.0,4.0,4.0,217.0,602.0],[0.0,-49.0,826.0,56.0,4.0,610.0,826.0,56.0]],"uatlas":[400.0,222.0],"upieces":[[84.0,-1050.0,658.0,224.0,4.0,4.0,329.0,112.0],[21.0,-812.0,784.0,196.0,4.0,120.0,392.0,98.0]],"spill":[[689.5,189.0,"#FFC46E",0.5],[696.5,199.5,"#B98CFF",0.4]],"neon":[{"f":"botanica.neon-moon.svg","box":[616.0,-595.0,161.0,147.0],"color":"#B98CFF","on":0.55}]},"mercado":{"kit":1,"kind":"bldg","layer":"near","foot":1260.0,"walls":[[0.0,-1036.0,1260.0,1036.0,"#F4D4AD","#6C5E7E",0.0,0.0,"#FADBB6","#A57F8E","#98839B","#4D425F"]],"atlas":[1478.0,480.5],"pieces":[[-7.0,-938.0,84.0,945.0,4.0,4.0,42.0,472.5],[1183.0,-938.0,84.0,945.0,50.0,4.0,42.0,472.5],[63.0,-567.0,1134.0,80.5,765.5,337.5,476.28,33.81],[63.0,-493.5,1134.0,136.5,338.0,197.0,1134.0,136.5],[91.0,-413.0,826.0,420.0,338.0,4.0,371.7,189.0],[917.0,-455.0,238.0,462.0,96.0,4.0,238.0,462.0],[105.0,-154.0,770.0,154.0,338.0,337.5,423.5,84.7]],"uatlas":[790.2,295.5],"upieces":[[-14.0,-1190.0,1288.0,252.0,125.18,165.5,644.0,126.0],[105.0,-917.0,1050.0,315.0,125.18,4.0,525.0,157.5],[966.0,-917.0,189.0,392.0,4.0,4.0,117.18,243.04]],"spill":[[500.5,791.0,"#FFC46E",0.9],[1060.5,161.0,"#FFD25A",0.4]],"neon":[{"f":"mercado.neon-blade.svg","box":[980.0,-931.0,161.0,420.0],"color":"#FFD25A","on":0.44}]},"mural":{"kit":1,"kind":"bldg","layer":"near","foot":1190.0,"walls":[[0.0,-1008.0,1190.0,1008.0,"#EED3B6","#6B5E84",0.0,28.0,"#F8DBBC","#A27F95","#9583A3","#4C4264"]],"atlas":[889.0,525.1],"pieces":[[49.0,-959.0,1064.0,903.0,225.5,4.0,404.32,343.14],[875.0,-462.0,175.0,469.0,46.5,4.0,175.0,469.0],[1085.0,-994.0,77.0,1001.0,4.0,4.0,38.5,500.5],[0.0,-56.0,1190.0,63.0,46.5,477.0,833.0,44.1]],"uatlas":[617.0,32.5],"upieces":[[-14.0,-1022.0,1218.0,49.0,4.0,4.0,609.0,24.5]],"spill":[],"neon":[]},"palmas":{"kit":1,"kind":"bldg","layer":"near","foot":1470.0,"walls":[[280.0,-1050.0,1190.0,1050.0,"#F1ACA3","#6C4C76",0.0,35.0,"#F9C4AE","#A46A86","#976B92","#4C3559"]],"atlas":[1337.0,526.0],"pieces":[[0.0,-1029.0,287.0,1036.0,4.0,4.0,143.5,518.0],[294.0,-511.0,1169.0,126.0,151.5,213.8,1169.0,126.0],[294.0,-483.0,1169.0,490.0,151.5,4.0,490.98,205.8],[280.0,-140.0,1190.0,147.0,151.5,343.8,595.0,73.5]],"uatlas":[792.0,316.5],"upieces":[[-49.0,-1127.0,1568.0,126.0,4.0,249.5,784.0,63.0],[294.0,-994.0,1169.0,483.0,4.0,4.0,584.5,241.5]],"spill":[[651.0,161.0,"#FFC46E",0.5],[1060.5,161.0,"#FFC46E",0.5]],"neon":[]},"barberia":{"kit":1,"kind":"bldg","layer":"near","foot":896.0,"walls":[[0.0,-875.0,896.0,875.0,"#F2CC86","#6C5B61",35.0,0.0,"#F9D699","#A47B70","#987E78","#4C3F48"]],"atlas":[847.9,470.0],"pieces":[[-49.0,-616.0,994.0,203.0,218.0,200.15,616.28,125.86],[35.0,-420.0,588.0,427.0,218.0,4.0,264.6,192.15],[420.0,-287.0,196.0,112.0,218.0,330.01,137.2,78.4],[616.0,-413.0,70.0,273.0,486.6,4.0,49.0,191.1],[679.0,-455.0,210.0,462.0,4.0,4.0,210.0,462.0]],"uatlas":[470.0,134.5],"upieces":[[-14.0,-889.0,924.0,49.0,4.0,106.0,462.0,24.5],[35.0,-826.0,833.0,196.0,4.0,4.0,416.5,98.0]],"spill":[[329.0,546.0,"#FFC46E",0.8],[528.5,161.0,"#FF3B4A",0.4]],"neon":[{"f":"barberia.neon-open.svg","box":[378.5,-328.5,217.5,144.2],"color":"#FF3B4A","on":0.38}]},"taller":{"kit":1,"kind":"bldg","layer":"near","foot":1190.0,"walls":[[0.0,-840.0,1190.0,840.0,"#CCC4B9","#5A5886",0.0,0.0,"#E6D2BE","#8D7797","#807AA6","#3F3C66"]],"atlas":[920.5,488.5],"pieces":[[63.0,-525.0,686.0,133.0,218.0,225.0,686.0,133.0],[70.0,-427.0,658.0,434.0,218.0,4.0,329.0,217.0],[742.0,-455.0,210.0,462.0,4.0,4.0,210.0,462.0],[966.0,-525.0,203.0,175.0,461.2,362.0,101.5,87.5],[945.0,-168.0,245.0,175.0,218.0,362.0,171.5,122.5],[686.0,-140.0,91.0,147.0,393.5,362.0,63.7,102.9]],"uatlas":[422.1,119.9],"upieces":[[-14.0,-854.0,1218.0,329.0,4.0,4.0,414.12,111.86]],"spill":[[399.0,616.0,"#FFC878",0.6]],"neon":[]},"farmacia":{"kit":1,"kind":"bldg","layer":"near","foot":1050.0,"walls":[[0.0,-826.0,861.0,826.0,"#F1DAC2","#6C618C",0.0,0.0,"#F9E0C4","#A4829E","#9787AD","#4C446B"],[861.0,-1106.0,161.0,1106.0,"#F1DAC2","#6C618C",0.0,21.0,"#F9E0C4","#A4829E","#9787AD","#4C446B"]],"atlas":[1142.0,470.0],"pieces":[[-28.0,-532.0,910.0,119.0,225.0,200.15,910.0,119.0],[35.0,-420.0,616.0,427.0,225.0,4.0,277.2,192.15],[651.0,-455.0,217.0,462.0,4.0,4.0,217.0,462.0],[889.0,-140.0,133.0,147.0,225.0,323.15,93.1,102.9]],"uatlas":[520.9,267.5],"upieces":[[756.0,-1316.0,350.0,266.0,74.5,4.0,175.0,133.0],[875.0,-1071.0,133.0,511.0,4.0,4.0,66.5,255.5],[-14.0,-840.0,882.0,245.0,74.5,141.0,441.0,122.5]],"spill":[[346.5,581.0,"#E8FFF0",0.8],[420.0,759.5,"#5CFF8A",0.35]],"neon":[{"f":"farmacia.neon-cross.svg","box":[815.5,-1323.0,252.0,252.0],"color":"#5CFF8A","on":0.36},{"f":"farmacia.neon-farm.svg","box":[14.0,-518.0,833.0,112.0],"color":"#5CFF8A","on":0.42}]},"boutik":{"kit":1,"kind":"bldg","layer":"near","foot":854.0,"walls":[[0.0,-602.0,854.0,602.0,"#54AC96","#224C6D",0.0,0.0,"#AAC3A5","#486A7C","#356B87","#163551"],[0.0,-812.0,854.0,210.0,"#F2BA3D","#6C522C",0.0,0.0,"#F9CC66","#A47239","#98733A","#4C3A1D"]],"atlas":[1010.8,271.0],"pieces":[[42.0,-525.0,784.0,140.0,214.5,4.0,784.0,140.0],[49.0,-462.0,413.0,469.0,4.0,4.0,206.5,234.5],[490.0,-378.0,336.0,238.0,214.5,148.0,168.0,119.0],[0.0,-91.0,854.0,98.0,386.5,148.0,597.8,68.6]],"uatlas":[449.0,127.0],"upieces":[[-14.0,-826.0,882.0,238.0,4.0,4.0,441.0,119.0]],"spill":[[259.0,364.0,"#FFC46E",0.5]],"neon":[]},"lot_fence":{"kit":1,"kind":"lot","layer":"near","foot":665.0,"walls":[],"atlas":[400.7,567.5],"pieces":[[-280.0,-1155.0,1155.0,903.0,4.0,4.0,392.7,307.02],[-35.0,-490.0,735.0,497.0,4.0,315.02,367.5,248.5]],"neon":[]},"lot_wall":{"kit":1,"kind":"lot","layer":"near","foot":560.0,"walls":[],"atlas":[323.0,488.0],"pieces":[[-35.0,-700.0,630.0,560.0,4.0,4.0,315.0,280.0],[-21.0,-385.0,602.0,392.0,4.0,288.0,301.0,196.0]],"neon":[]},"lot_parking":{"kit":1,"kind":"lot","layer":"near","foot":1260.0,"walls":[],"atlas":[832.6,288.0],"pieces":[[945.0,-665.0,315.0,560.0,4.0,4.0,157.5,280.0],[-21.0,-490.0,1295.0,497.0,165.5,4.0,647.5,248.5]],"neon":[]},"lot_garden":{"kit":1,"kind":"lot","layer":"near","foot":630.0,"walls":[],"atlas":[365.0,464.9],"pieces":[[-245.0,-1120.0,1050.0,910.0,4.0,4.0,357.0,309.4],[-21.0,-280.0,672.0,287.0,4.0,317.4,336.0,143.5]],"neon":[]},"yard_hedge":{"kit":1,"kind":"yard","layer":"near","foot":336.0,"walls":[],"atlas":[171.8,130.9],"pieces":[[-14.0,-266.0,364.0,273.0,4.0,4.0,163.8,122.85]],"neon":[]},"yard_wall":{"kit":1,"kind":"yard","layer":"near","foot":364.0,"walls":[],"atlas":[184.4,162.3],"pieces":[[-14.0,-336.0,392.0,343.0,4.0,4.0,176.4,154.35]],"neon":[]},"yard_palm":{"kit":1,"kind":"yard","layer":"near","foot":385.0,"walls":[],"atlas":[305.5,434.8],"pieces":[[-245.0,-1120.0,875.0,910.0,4.0,4.0,297.5,309.4],[-14.0,-245.0,413.0,252.0,4.0,317.4,185.85,113.4]],"neon":[]},"yard_seagrape":{"kit":1,"kind":"yard","layer":"near","foot":350.0,"walls":[],"atlas":[197.0,197.0],"pieces":[[-35.0,-413.0,420.0,420.0,4.0,4.0,189.0,189.0]],"neon":[]},"lamp":{"kit":1,"kind":"prop","layer":"near","foot":0,"walls":[],"atlas":[52.1,445.9],"pieces":[[-49.0,-966.0,98.0,973.0,4.0,4.0,44.1,437.85]],"shadow":[[-17.5,17.5,826.0]],"head":[0,-892.5],"neon":[]},"bench":{"kit":1,"kind":"prop","layer":"near","foot":0,"walls":[],"atlas":[343.5,359.5],"pieces":[[-14.0,-217.0,406.0,224.0,86.12,4.0,251.72,138.88],[399.0,-560.0,126.0,567.0,4.0,4.0,78.12,351.54]],"shadow":[[0.0,378.0,105.0],[455.0,469.0,525.0]],"neon":[]},"hydrant":{"kit":1,"kind":"prop","layer":"near","foot":0,"walls":[],"atlas":[76.6,135.4],"pieces":[[-49.0,-175.0,98.0,182.0,4.0,4.0,68.6,127.4]],"shadow":[[-24.5,24.5,147.0]],"neon":[]},"newsbox":{"kit":1,"kind":"prop","layer":"near","foot":0,"walls":[],"atlas":[86.4,174.6],"pieces":[[-49.0,-231.0,112.0,238.0,4.0,4.0,78.4,166.6]],"shadow":[[-42.0,42.0,217.0]],"neon":[]},"planter":{"kit":1,"kind":"prop","layer":"near","foot":0,"walls":[],"atlas":[174.6,248.1],"pieces":[[-119.0,-336.0,238.0,343.0,4.0,4.0,166.6,240.1]],"shadow":[[-91.0,91.0,140.0]],"neon":[]},"porch":{"kit":1,"kind":"porch","layer":"porch","foot":0,"walls":[[-245.0,-602.0,490.0,602.0,"#F3CD8E","#6D5B67",0.0,0.0,"#FBD8A0","#A67D76","#937B7F","#4C3F4C"]],"atlas":[370.6,364.2],"pieces":[[-166.0,-602.0,252.0,504.0,4.0,4.0,126.0,252.0],[-252.0,-595.0,196.0,322.0,134.0,4.0,88.2,144.9],[70.0,-595.0,196.0,322.0,226.2,4.0,88.2,144.9],[-259.0,-126.0,518.0,136.5,4.0,264.7,362.6,95.55],[-194.0,-602.0,98.0,154.0,134.0,152.9,68.6,107.8]],"uatlas":[356.9,141.0],"upieces":[[-266.0,-840.0,532.0,266.0,4.0,4.0,266.0,133.0],[-96.0,-595.0,112.0,56.0,274.0,4.0,78.4,39.2]],"light":[49.3,-427.0],"neon":[]},"tree":{"kit":1,"kind":"tree","layer":"tree","foot":0,"walls":[],"atlas":[777.2,548.3],"pieces":[[-250.0,-6.0,510.0,48.0,4.0,527.5,178.5,16.8],[-250.0,-306.0,516.0,320.0,4.0,4.0,516.0,320.0],[-250.0,-526.0,905.0,230.0,4.0,328.0,769.25,195.5]],"uatlas":[551.0,314.0],"upieces":[[-250.0,-1020.0,905.0,510.0,4.0,4.0,543.0,306.0]],"hang":[[-44,330],[0,352],[44,330]],"twig":37,"half":[250,650],"neon":[]},"mid_apts":{"kind":"bldg","scale":1.5,"vb":[-30.0,-360.0,510.0,372.0],"layer":"mid","neon":[]},"mid_motel":{"kind":"bldg","scale":1.5,"vb":[-30.0,-468.0,495.0,480.0],"layer":"mid","neon":[{"f":"mid_motel.neon-motel.svg","box":[318.0,-459.0,93.0,210.0],"color":"#FF8FB0","on":0.4},{"f":"mid_motel.neon-arrow.svg","box":[252.0,-285.0,150.0,75.0],"color":"#FFD25A","on":0.48}]},"mid_house":{"kind":"bldg","scale":1.5,"vb":[-21.0,-225.0,357.0,237.0],"layer":"mid","neon":[]},"mid_warehouse":{"kind":"bldg","scale":1.5,"vb":[-30.0,-435.0,540.0,447.0],"layer":"mid","neon":[]},"mid_bank":{"kind":"bldg","scale":1.5,"vb":[-21.0,-210.0,402.0,222.0],"layer":"mid","neon":[]},"mid_royals":{"kind":"palm","scale":1.5,"vb":[-165.0,-630.0,495.0,642.0],"layer":"mid","neon":[]},"mid_cocos":{"kind":"palm","scale":1.5,"vb":[-165.0,-570.0,450.0,582.0],"layer":"mid","neon":[]},"mid_royal1":{"kind":"palm","scale":1.5,"vb":[-150.0,-600.0,300.0,612.0],"layer":"mid","neon":[]},"mid_mango":{"kind":"tree","scale":1.5,"vb":[-180.0,-354.0,360.0,366.0],"layer":"mid","neon":[]},"mid_ficus":{"kind":"tree","scale":1.5,"vb":[-219.0,-342.0,438.0,354.0],"layer":"mid","neon":[]},"mid_pole":{"kind":"pole","wires":[[-24.0,-444.0],[-12.0,-444.0],[12.0,-444.0],[24.0,-444.0],[-33.0,-411.0],[33.0,-411.0]],"scale":1.5,"vb":[-45.0,-459.0,90.0,471.0],"layer":"mid","neon":[]},"far_towers_a":{"kind":"cluster","blink":[[130,-274]],"vb":[-40.0,-290.0,270.0,296.0],"layer":"far","neon":[]},"far_towers_b":{"kind":"cluster","blink":[[120,-244]],"vb":[-30.0,-260.0,300.0,266.0],"layer":"far","neon":[]},"far_low_a":{"kind":"cluster","vb":[-20.0,-190.0,340.0,196.0],"layer":"far","neon":[]},"far_low_b":{"kind":"cluster","blink":[[180,-264]],"vb":[-20.0,-280.0,320.0,286.0],"layer":"far","neon":[]},"far_trees":{"kind":"cluster","vb":[-50.0,-170.0,420.0,176.0],"layer":"far","neon":[]},"cloud_a":{"kind":"cloud","vb":[-20.0,-150.0,460.0,170.0],"layer":"sky","neon":[]},"cloud_b":{"kind":"cloud","vb":[-20.0,-112.0,340.0,130.0],"layer":"sky","neon":[]},"cloud_c":{"kind":"cloud","vb":[-20.0,-128.0,600.0,148.0],"layer":"sky","neon":[]},"cloud_d":{"kind":"cloud","vb":[-20.0,-100.0,260.0,120.0],"layer":"sky","neon":[]},"deck_a":{"kind":"deck","vb":[-20.0,-100.0,640.0,120.0],"layer":"sky","neon":[]},"deck_b":{"kind":"deck","vb":[-20.0,-100.0,500.0,120.0],"layer":"sky","neon":[]},"cirrus_a":{"kind":"cirrus","vb":[-20.0,-40.0,560.0,80.0],"layer":"sky","neon":[]},"cirrus_b":{"kind":"cirrus","vb":[-20.0,-40.0,420.0,80.0],"layer":"sky","neon":[]},"ground_walk":{"kind":"ground","vb":[0.0,0.0,960.0,44.0],"layer":"ground","neon":[]},"ground_curb":{"kind":"ground","vb":[0.0,44.0,960.0,6.0],"layer":"ground","neon":[]},"ground_street":{"kind":"ground","vb":[0.0,50.0,960.0,70.0],"layer":"ground","neon":[]},"tdecor_sign":{"kind":"tdecor","scale":2.6,"vb":[-78.0,-192.4,156.0,130.0],"layer":"tdecor","neon":[]},"tdecor_bike":{"kind":"tdecor","scale":4.2,"vb":[-260.4,-218.4,646.8,310.8],"layer":"tdecor","neon":[]},"tdecor_chair":{"kind":"tdecor","scale":3.5,"vb":[-259.0,-196.0,189.0,266.0],"layer":"tdecor","neon":[]},"fg_trunk":{"kind":"fg","vb":[-50.0,-1320.0,100.0,1470.0],"layer":"fg","neon":[]}} ;

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function hash(i) { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
const h2 = (i, j) => hash(i * 157.31 + j * 13.7 + 0.37);
const mod = (a, n) => ((a % n) + n) % n;
function hex(c) { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mixc(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
function css(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a === undefined ? 1 : a) + ')'; }
let PIXELS = 0;
function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); PIXELS += c.width * c.height; return c; }

const CFG = { porchX: i => 5200 + i * 6200, runnerX: 0.28, grain: true, vignette: true, fgTrunk: true, fgFade: true };

function pickRes() {
  if (window.SCENE_RES) return +window.SCENE_RES;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const S = Math.min(innerHeight * dpr / 620, innerWidth * dpr / 600);
  return clamp(S, 1.25, 2);
}
const RES = pickRes();
const LAYER_RES = { tree: 0.85, tdecor: 0.5, mid: 0.34, far: 0.5, sky: 0.5, ground: 1, fg: 0.5 };
const K_NEAR = 0.51;
const UPPER_PX = 0.6;

const SPR = {};
const GEN = {};
let READY = false;
function base() { return window.SCENE_BASE || ''; }
function loadImage(src) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => (im.decode ? im.decode().catch(() => 0) : Promise.resolve()).then(() => res(im));
    im.onerror = () => rej(new Error('scene: could not load ' + src));
    im.src = src;
  });
}
function raster(im, w, h, r) {
  const c = mk(w * r, h * r);
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
  return c;
}
async function loadNeon(spr, m, dir, r) {
  for (const n of m.neon || []) {
    const im = await loadImage(dir + n.f);
    spr.neon.push({ c: raster(im, n.box[2], n.box[3], r), box: n.box, color: n.color, on: n.on });
  }
}
async function loadAsset(name, m) {
  const dir = base() + 'scene/art/';
  if (m.kit) return loadKit(name, m, dir);
  const lr = RES * (LAYER_RES[m.layer] || 1);
  const [, , w, h] = m.vb;
  const [dImg, nImg] = await Promise.all([loadImage(dir + name + '.day.svg'), loadImage(dir + name + '.dusk.svg')]);
  const spr = { vb: m.vb, day: raster(dImg, w, h, lr), dusk: raster(nImg, w, h, lr), neon: [], m };
  await loadNeon(spr, m, dir, Math.min(lr, 1.2));
  SPR[name] = spr;
}
async function loadKit(name, m, dir) {
  const r = RES * K_NEAR, ru = Math.min(r, UPPER_PX);
  const spr = { m, neon: [], r, ru };
  const jobs = [];
  if (m.atlas) jobs.push(Promise.all([loadImage(dir + name + '.day.svg'), loadImage(dir + name + '.dusk.svg')]).then(([a, b]) => {
    spr.day = raster(a, m.atlas[0], m.atlas[1], r); spr.dusk = raster(b, m.atlas[0], m.atlas[1], r); }));
  if (m.uatlas) jobs.push(Promise.all([loadImage(dir + name + '.up.day.svg'), loadImage(dir + name + '.up.dusk.svg')]).then(([a, b]) => {
    spr.uday = raster(a, m.uatlas[0], m.uatlas[1], ru); spr.udusk = raster(b, m.uatlas[0], m.uatlas[1], ru); }));
  await Promise.all(jobs);
  await loadNeon(spr, m, dir, Math.min(RES * 0.6, 1.1));
  spr.walls = (m.walls || []).map(w => ({ day: wallTex(w, false), dusk: wallTex(w, true) }));
  SPR[name] = spr;
}

function radial(size, stops) {
  const c = mk(size, size), x = c.getContext('2d'), g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) g.addColorStop(o, col);
  x.fillStyle = g; x.fillRect(0, 0, size, size); return c;
}

function wallTex(w, dusk) {
  const c = mk(128, 64), x = c.getContext('2d');
  const face = dusk ? w[5] : w[4], lit = dusk ? w[9] : w[8], dark = dusk ? w[11] : w[10];
  x.fillStyle = face; x.fillRect(0, 0, 128, 64);
  let g = x.createLinearGradient(0, 0, 0, 64);
  if (!dusk) { g.addColorStop(0, 'rgba(255,244,226,0.16)'); g.addColorStop(0.3, 'rgba(255,244,226,0)'); g.addColorStop(0.8, 'rgba(59,46,102,0)'); g.addColorStop(1, 'rgba(59,46,102,0.2)'); }
  else { g.addColorStop(0, 'rgba(185,164,216,0.10)'); g.addColorStop(0.4, 'rgba(185,164,216,0)'); g.addColorStop(1, 'rgba(18,14,38,0.26)'); }
  x.fillStyle = g; x.fillRect(0, 0, 128, 64);
  g = x.createLinearGradient(0, 0, 128, 0);
  if (!dusk) { g.addColorStop(0, 'rgba(106,90,154,0.08)'); g.addColorStop(0.5, 'rgba(255,176,112,0.03)'); g.addColorStop(1, 'rgba(255,176,112,0.18)'); }
  else { g.addColorStop(0, 'rgba(18,14,38,0.06)'); g.addColorStop(0.7, 'rgba(229,142,134,0)'); g.addColorStop(1, 'rgba(229,142,134,0.1)'); }
  x.fillStyle = g; x.fillRect(0, 0, 128, 64);
  const rr = w[7] / w[2] * 128, rl = w[6] / w[2] * 128;
  if (rr > 0.5) {
    g = x.createLinearGradient(128 - rr, 0, 128, 0);
    g.addColorStop(0, css(hex(lit), 0)); g.addColorStop(0.5, css(hex(lit), 0.85)); g.addColorStop(0.8, css(hex(lit), 1)); g.addColorStop(1, css(hex(face), 0.9));
    x.fillStyle = g; x.fillRect(128 - rr, 0, rr, 64);
  }
  if (rl > 0.5) {
    g = x.createLinearGradient(0, 0, rl, 0);
    g.addColorStop(0, css(hex(dark), 1)); g.addColorStop(0.6, css(hex(dark), 0.6)); g.addColorStop(1, css(hex(dark), 0));
    x.fillStyle = g; x.fillRect(0, 0, rl, 64);
  }
  return c;
}

function makeFronds() {
  const c = mk(200, 120), x = c.getContext('2d');
  x.fillStyle = '#000';
  const frond = (bx, by, ang, len, droop, seed) => {
    let px = bx, py = by;
    const pts = [];
    for (let i = 0; i <= 18; i++) {
      const t = i / 18, a = ang + droop * t * t;
      pts.push([px, py]);
      px += Math.cos(a) * len / 18; py += Math.sin(a) * len / 18;
    }
    x.lineCap = 'round';
    for (let i = 1; i < pts.length - 1; i++) {
      const t = i / 18, [qx, qy] = pts[i], [nx, ny] = pts[i + 1], tx = nx - qx, ty = ny - qy, tl = Math.hypot(tx, ty) || 1;
      const L = len * 0.24 * Math.sin(Math.PI * Math.min(1, t * 1.15)) * (0.85 + 0.3 * hash(seed + i));
      for (const sd of [1, -1]) {
        const ox = -ty / tl * sd, oy = tx / tl * sd;
        x.lineWidth = 1.6; x.beginPath(); x.moveTo(qx, qy);
        x.quadraticCurveTo(qx + ox * L * 0.5, qy + oy * L * 0.5, qx + (ox * 0.6 + tx / tl * 0.4) * L, qy + (oy * 0.6 + ty / tl * 0.4) * L + L * 0.35);
        x.stroke();
      }
    }
    x.lineWidth = 1.4; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]);
    for (const [qx, qy] of pts) x.lineTo(qx, qy);
    x.stroke();
  };
  x.strokeStyle = '#000';
  frond(-10, 18, 0.15, 120, 0.9, 1); frond(-20, 56, -0.1, 110, 1.1, 2); frond(30, -10, 0.55, 100, 0.7, 3); frond(200, 30, Math.PI - 0.2, 90, -0.9, 4);
  return c;
}

function makeStucco() {
  const N = 256, c = mk(N, N), x = c.getContext('2d'), id = x.createImageData(N, N);
  let seed = 7654321;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const G = 8, grid = [];
  for (let i = 0; i < G * G; i++) grid.push(rnd());
  const sm = t => t * t * (3 - 2 * t);
  const val = (u, v) => {
    const i = Math.floor(u), j = Math.floor(v), fu = sm(u - i), fv = sm(v - j);
    const a = grid[mod(j, G) * G + mod(i, G)], b = grid[mod(j, G) * G + mod(i + 1, G)];
    const cc = grid[mod(j + 1, G) * G + mod(i, G)], d = grid[mod(j + 1, G) * G + mod(i + 1, G)];
    return lerp(lerp(a, b, fu), lerp(cc, d, fu), fv);
  };
  for (let py = 0; py < N; py++) for (let px = 0; px < N; px++) {
    const k = (py * N + px) * 4, b = val(px / 32, py / 32) * 0.65 + val(px / 16 + 3.3, py / 16 + 1.7) * 0.35, s = rnd();
    if (s > 0.986) { id.data[k] = id.data[k + 1] = id.data[k + 2] = 255; id.data[k + 3] = 70; }
    else if (s < 0.022) { id.data[k] = 60; id.data[k + 1] = 46; id.data[k + 2] = 72; id.data[k + 3] = 64; }
    else { id.data[k] = 70; id.data[k + 1] = 54; id.data[k + 2] = 80; id.data[k + 3] = Math.max(0, b - 0.56) * 90; }
  }
  x.putImageData(id, 0, 0);
  return c;
}
function makeGenerated() {
  GEN.sunA = radial(160, [[0, 'rgba(255,250,232,1)'], [0.5, 'rgba(255,240,200,1)'], [0.6, 'rgba(255,226,170,0.98)'], [0.64, 'rgba(255,214,150,0.5)'], [0.72, 'rgba(255,200,140,0)'], [1, 'rgba(255,200,140,0)']]);
  GEN.sunB = radial(160, [[0, 'rgba(255,214,150,1)'], [0.5, 'rgba(255,170,100,1)'], [0.6, 'rgba(250,130,80,0.98)'], [0.64, 'rgba(240,110,70,0.5)'], [0.72, 'rgba(240,110,70,0)'], [1, 'rgba(240,110,70,0)']]);
  GEN.glow = radial(256, [[0, 'rgba(255,206,150,0.85)'], [0.12, 'rgba(255,180,120,0.5)'], [0.35, 'rgba(250,150,105,0.18)'], [0.7, 'rgba(240,130,110,0.05)'], [1, 'rgba(240,130,110,0)']]);
  GEN.pool = radial(128, [[0, 'rgba(255,255,255,0.9)'], [0.5, 'rgba(255,255,255,0.32)'], [1, 'rgba(255,255,255,0)']]);
  GEN.tints = {};
  const mc = mk(64, 64), mx = mc.getContext('2d');
  mx.fillStyle = '#FFF4DA'; mx.beginPath(); mx.arc(32, 32, 22, 0, Math.PI * 2); mx.fill();
  mx.globalCompositeOperation = 'destination-out'; mx.beginPath(); mx.arc(41, 27, 21, 0, Math.PI * 2); mx.fill();
  GEN.moon = mc;
  const vc = mk(256, 160), vx = vc.getContext('2d');
  const vg = vx.createRadialGradient(128, 70, 30, 128, 80, 170);
  vg.addColorStop(0, 'rgba(20,14,40,0)'); vg.addColorStop(0.6, 'rgba(20,14,40,0)'); vg.addColorStop(1, 'rgba(20,14,40,0.55)');
  vx.fillStyle = vg; vx.fillRect(0, 0, 256, 160);
  GEN.vignette = vc;
  const gc = mk(128, 128), gx = gc.getContext('2d'), id = gx.createImageData(128, 128);
  let seed = 1234567;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < id.data.length; i += 4) {
    const v = rnd(), on = v > 0.5;
    id.data[i] = id.data[i + 1] = id.data[i + 2] = on ? 255 : 0;
    id.data[i + 3] = Math.abs(v - 0.5) * 2 > 0.55 ? (Math.abs(v - 0.5) * 2 - 0.55) * 120 : 0;
  }
  gx.putImageData(id, 0, 0);
  GEN.grain = gc;
  GEN.stucco = makeStucco();
  GEN.fronds = makeFronds();
  GEN.sky = mk(4, 256); GEN.haze = mk(4, 64); GEN.skyP = -1;
  const rc = mk(512, 512), rx = rc.getContext('2d');
  rx.translate(256, 256);
  for (let i = 0; i < 26; i++) {
    const a = i / 26 * Math.PI * 2 + hash(i) * 0.2, wd = 0.02 + hash(i * 3.3) * 0.05, len = 180 + hash(i * 7.1) * 76;
    const g = rx.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len);
    g.addColorStop(0, 'rgba(255,226,170,0)'); g.addColorStop(0.18, 'rgba(255,226,170,0.9)'); g.addColorStop(1, 'rgba(255,200,150,0)');
    rx.fillStyle = g; rx.beginPath(); rx.moveTo(0, 0);
    rx.lineTo(Math.cos(a - wd) * len, Math.sin(a - wd) * len); rx.lineTo(Math.cos(a + wd) * len, Math.sin(a + wd) * len); rx.fill();
  }
  const hc = mk(512, 512), hx = hc.getContext('2d');
  hx.drawImage(GEN.glow, 0, 0, 512, 512); hx.globalAlpha = 0.32; hx.drawImage(rc, 0, 0);
  GEN.halo = hc;
  PIXELS -= 512 * 512;
}
function tinted(color) {
  let c = GEN.tints[color];
  if (!c) {
    c = mk(128, 128); const x = c.getContext('2d');
    x.drawImage(GEN.pool, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, 128, 128);
    GEN.tints[color] = c;
  }
  return c;
}

const SKY_TOP = -720;
const SKY_KEYS = [
  [0.0, [[-720, '#4E5290'], [-260, '#6A66A0'], [40, '#9A7EAA'], [170, '#D49AA0'], [270, '#F4AE7C'], [350, '#F9CC8E'], [420, '#FBE2B0']]],
  [0.5, [[-720, '#2C2852'], [-260, '#443A70'], [40, '#765886'], [190, '#BE7088'], [290, '#F08C5C'], [365, '#F5AA6A'], [420, '#F8C98E']]],
  [1.0, [[-720, '#100E24'], [-260, '#1C1838'], [40, '#2B2748'], [200, '#4A3B6A'], [300, '#875672'], [370, '#CF7058'], [420, '#EA9864']]],
].map(([p, st]) => [p, st.map(([y, c]) => [y, hex(c)])]);
function skyStops(p) {
  let a = SKY_KEYS[0], b = SKY_KEYS[1];
  if (p > 0.5) { a = SKY_KEYS[1]; b = SKY_KEYS[2]; }
  const t = clamp((p - a[0]) / (b[0] - a[0]), 0, 1);
  return a[1].map((s, i) => [lerp(s[0], b[1][i][0], t), mixc(s[1], b[1][i][1], t)]);
}
function updateSky(p) {
  if (Math.abs(p - GEN.skyP) < 0.003) return;
  GEN.skyP = p;
  const st = skyStops(p), span = GROUND - SKY_TOP;
  let x = GEN.sky.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256);
  for (const [y, c] of st) g.addColorStop(clamp((y - SKY_TOP) / span, 0, 1), css(c));
  x.fillStyle = g; x.fillRect(0, 0, 4, 256);
  const hz = st[st.length - 1][1], hz2 = st[st.length - 2][1];
  x = GEN.haze.getContext('2d'); x.clearRect(0, 0, 4, 64);
  g = x.createLinearGradient(0, 0, 0, 64);
  g.addColorStop(0, css(hz2, 0)); g.addColorStop(0.55, css(mixc(hz2, hz, 0.5), 0.35)); g.addColorStop(1, css(hz, 0.75));
  x.fillStyle = g; x.fillRect(0, 0, 4, 64);
}

function names(layer, kind) { return Object.keys(MAN).filter(k => SPR[k] && SPR[k].m.layer === layer && SPR[k].m.kind === kind); }
let LISTS = null;
function lists() {
  if (LISTS) return LISTS;
  LISTS = {
    bldg: names('near', 'bldg'), lot: names('near', 'lot'), yard: names('near', 'yard'),
    midB: names('mid', 'bldg'), midP: names('mid', 'palm'), midT: names('mid', 'tree'),
    far: names('far', 'cluster'), cloud: names('sky', 'cloud'), cirrus: names('sky', 'cirrus'), deck: names('sky', 'deck'),
  };
  return LISTS;
}

const NEAR = { W: -1, segs: [], x: 0, i: 0, zone: 0, recent: [] };
const PORCH_HALF = 272;
function porchCenter(i, W) { return CFG.porchX(i) + CFG.runnerX * W; }
function nearEnsure(W, upto) {
  const L = lists();
  if (NEAR.W !== W) { NEAR.W = W; NEAR.segs = []; NEAR.x = -900; NEAR.i = 0; NEAR.zone = 0; NEAR.recent = []; }
  if (!L.bldg.length) return;
  while (NEAR.x < upto) {
    const zc = porchCenter(NEAR.zone, W), z0 = zc - PORCH_HALF, z1 = zc + PORCH_HALF;
    let cand;
    const r = hash(NEAR.i * 3.17 + 1), prevLot = NEAR.segs.length && NEAR.segs[NEAR.segs.length - 1].kind !== 'bldg';
    if (L.lot.length && !prevLot && r < 0.42) cand = { kind: 'lot', name: L.lot[Math.floor(hash(NEAR.i * 7.3 + 2) * L.lot.length)] };
    else {
      let k = Math.floor(hash(NEAR.i * 5.1 + 3) * L.bldg.length), tries = 0;
      while (NEAR.recent.includes(L.bldg[k]) && tries++ < 8) k = (k + 1) % L.bldg.length;
      cand = { kind: 'bldg', name: L.bldg[k] };
    }
    const w = SPR[cand.name].m.foot;
    if (NEAR.x + w > z0) {
      NEAR.segs.push({ x: NEAR.x, w: z1 - NEAR.x, kind: 'yard', i: NEAR.i, zc });
      NEAR.x = z1; NEAR.zone++; NEAR.i++; continue;
    }
    NEAR.segs.push({ x: NEAR.x, w, kind: cand.kind, name: cand.name, i: NEAR.i });
    if (cand.kind === 'bldg') { NEAR.recent.push(cand.name); if (NEAR.recent.length > Math.min(4, L.bldg.length - 1)) NEAR.recent.shift(); }
    NEAR.x += w - (cand.kind === 'bldg' ? 1 : 0); NEAR.i++;
  }
}
function firstSeg(x) {
  const s = NEAR.segs; let lo = 0, hi = s.length - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; if (s[m].x + s[m].w < x) lo = m + 1; else hi = m; }
  return lo;
}

function openColumns(W, dist) {
  nearEnsure(W, dist + W + 1600);
  const occ = [];
  for (let k = firstSeg(dist - 400); k < NEAR.segs.length; k++) {
    const sg = NEAR.segs[k], x = sg.x - dist; if (x > W) break;
    if (sg.kind !== 'bldg') continue;
    for (const w of SPR[sg.name].m.walls) if (GROUND + w[1] <= VIEW.top && w[1] + w[3] >= -1) occ.push([x + w[0], x + w[0] + w[2]]);
  }
  occ.sort((a, b) => a[0] - b[0]);
  const open = []; let cur = 0;
  for (const [a, b] of occ) { if (a > cur + 1) open.push([cur, Math.min(a + 1, W)]); cur = Math.max(cur, b - 1); if (cur >= W) break; }
  if (cur < W) open.push([cur, W]);
  return open;
}
function inPorchZone(x, W, pad) {
  const i = Math.max(0, Math.round((x - CFG.runnerX * W - CFG.porchX(0)) / (CFG.porchX(1) - CFG.porchX(0))));
  for (let k = Math.max(0, i - 1); k <= i + 1; k++) if (Math.abs(x - porchCenter(k, W)) < PORCH_HALF + (pad || 40)) return true;
  return false;
}

const SEE = 0.002;
function blit(ctx, spr, gx, gy, m, alpha) {
  const v = spr.vb; alpha = alpha === undefined ? 1 : alpha;
  if (alpha <= SEE) return;
  if (m < 0.999) { ctx.globalAlpha = alpha; ctx.drawImage(spr.day, gx + v[0], gy + v[1], v[2], v[3]); }
  if (m > 0.001) { ctx.globalAlpha = alpha * m; ctx.drawImage(spr.dusk, gx + v[0], gy + v[1], v[2], v[3]); }
  ctx.globalAlpha = 1;
}
const VIEW = { W: 1000, top: -80 };
function stuccoPat(ctx) { return GEN.stuccoPat || (GEN.stuccoPat = ctx.createPattern(GEN.stucco, 'repeat')); }
function drawPieces(ctx, A, B, r, list, gx, gy, m) {
  for (let i = 0; i < list.length; i++) {
    const p = list[i], X = gx + p[0], Y = gy + p[1];
    if (X > VIEW.W || X + p[2] < 0 || Y > H || Y + p[3] < VIEW.top) continue;
    if (m < 0.999) ctx.drawImage(A, p[4] * r, p[5] * r, p[6] * r, p[7] * r, X, Y, p[2], p[3]);
    if (m > 0.001) { ctx.globalAlpha = m; ctx.drawImage(B, p[4] * r, p[5] * r, p[6] * r, p[7] * r, X, Y, p[2], p[3]); ctx.globalAlpha = 1; }
  }
}

function drawKit(ctx, spr, gx, gy, m) {
  const M = spr.m;
  for (let i = 0; i < M.walls.length; i++) {
    const w = M.walls[i], T = spr.walls[i], X = gx + w[0], Y = Math.max(gy + w[1], VIEW.top - 2), hh = gy + w[1] + w[3] - Y;
    if (X > VIEW.W || X + w[2] < 0 || hh <= 0) continue;
    const sy = (Y - (gy + w[1])) / w[3] * 64;
    let tex = T.day;
    if (m > 0.999) tex = T.dusk;
    else if (m > 0.001) {
      if (!T.mix) T.mix = mk(128, 64);
      if (T.mixM === undefined || Math.abs(T.mixM - m) > 0.012) {
        const q = T.mix.getContext('2d'); q.globalAlpha = 1; q.drawImage(T.day, 0, 0); q.globalAlpha = m; q.drawImage(T.dusk, 0, 0); T.mixM = m;
      }
      tex = T.mix;
    }
    ctx.drawImage(tex, 0, sy, 128, 64 - sy, X, Y, w[2], hh);
    const P = stuccoPat(ctx);
    P.setTransform(new DOMMatrix([1.6, 0, 0, 1.6, gx, gy]));
    ctx.globalAlpha = 0.6 - 0.3 * m; ctx.fillStyle = P; ctx.fillRect(X, Y, w[2], hh);
    ctx.globalAlpha = 1;
  }
  if (spr.day) drawPieces(ctx, spr.day, spr.dusk, spr.r, M.pieces, gx, gy, m);
  if (spr.uday && gy - 510 > VIEW.top) drawPieces(ctx, spr.uday, spr.udusk, spr.ru, M.upieces, gx, gy, m);
}

function neonLevel(on, seed, p, t) {
  const at = on + (hash(seed) - 0.5) * 0.08;
  if (p < at) return 0;
  if (p < at + 0.016) return hash(Math.floor(t * 17) + seed * 31.7) > 0.5 ? 0.85 : 0.08;
  return hash(Math.floor(t * 9) + seed * 7.3) > 0.992 ? 0.45 : 1;
}
function drawNeon(ctx, spr, gx, gy, seed, p, t) {
  for (let k = 0; k < spr.neon.length; k++) {
    const n = spr.neon[k], a = neonLevel(n.on, seed * 13 + k * 101, p, t);
    if (a <= 0) continue;
    ctx.globalAlpha = a;
    ctx.drawImage(n.c, gx + n.box[0], gy + n.box[1], n.box[2], n.box[3]);
  }
  ctx.globalAlpha = 1;
}
function pool(ctx, x, y, rx, ry, color, a) {
  if (a <= 0.003) return;
  ctx.globalAlpha = Math.min(1, a);
  ctx.drawImage(tinted(color), x - rx, y - ry, rx * 2, ry * 2);
  ctx.globalAlpha = 1;
}

function propShadows(ctx, spr, x, m) {
  const sh = spr.m.shadow; if (!sh || m > 0.97) return;
  for (const [x0, x1, h] of sh) {
    const len = h * 0.62, a = (1 - m) * 0.32, X0 = x + x0, X1 = x + x1;
    const g = ctx.createLinearGradient(X0, 0, X0 - len, 0);
    g.addColorStop(0, 'rgba(58,43,110,' + a + ')'); g.addColorStop(1, 'rgba(58,43,110,0)');
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(X0, GROUND + 1); ctx.lineTo(X1, GROUND + 1); ctx.lineTo(X1 - len, GROUND + 30); ctx.lineTo(X0 - len - 6, GROUND + 30); ctx.fill();
  }
}

const TDECOR = ['tdecor_sign', 'tdecor_bike', null, 'tdecor_chair', 'tdecor_sign'];
const STARS = [];
for (let i = 0; i < 90; i++) STARS.push([hash(i * 3.1), lerp(SKY_TOP, 190, Math.pow(hash(i * 5.7 + 1), 1.6)), 0.5 + hash(i * 9.3) * 1.1, hash(i * 2.9) * 6.28]);
const CLOUDS = [];
function cloudSetup() {
  const L = lists();
  const add = (nm, n, y0, y1, sp, sc0, sc1, depth) => {
    for (let i = 0; i < n; i++) CLOUDS.push({ name: nm[Math.floor(hash(CLOUDS.length * 4.7 + 9) * nm.length)], x: hash(CLOUDS.length * 2.3 + 1) * 3600,
      y: lerp(y0, y1, hash(CLOUDS.length * 6.1 + 2)), sp, sc: lerp(sc0, sc1, hash(CLOUDS.length * 8.9 + 3)), depth });
  };
  if (L.cirrus.length) add(L.cirrus, 8, -660, 40, 3, 0.8, 1.4, 0.015);
  if (L.deck.length) add(L.deck, 3, -560, -120, 4, 0.9, 1.4, 0.02);
  if (L.cloud.length) { add(L.cloud, 9, -540, 110, 5, 0.6, 1.15, 0.03); add(L.cloud, 7, 160, 300, 7, 0.5, 0.85, 0.045); }
  CLOUDS.sort((a, b) => a.depth - b.depth);
}
function drawSky(ctx, W, OY, p, t, dist, m) {
  updateSky(p);
  const top = -OY, span = GROUND - SKY_TOP;
  if (top < SKY_TOP) { ctx.fillStyle = css(skyStops(p)[0][1]); ctx.fillRect(0, top, W, SKY_TOP - top + 1); }
  const y0 = Math.max(top, SKY_TOP), sy = (y0 - SKY_TOP) / span * 256;
  ctx.drawImage(GEN.sky, 0, sy, 4, 256 - sy, -1, y0, W + 2, GROUND - y0 + 2);
  const sa = sstep(0.55, 0.95, p);
  if (sa > 0) {
    ctx.fillStyle = '#FFF4E0';
    for (const [fx, y, r, ph] of STARS) {
      if (y < top) continue;
      const fade = 1 - clamp(y / 200, 0, 1) * 0.8;
      ctx.globalAlpha = sa * fade * (0.55 + 0.45 * Math.sin(t * 2.1 + ph * 3));
      ctx.fillRect(fx * W, y, r, r);
    }
    ctx.globalAlpha = 1;
  }
  const mxp = W * 0.43, myp = Math.max(top + 46, 58 - OY * 0.55);
  ctx.globalAlpha = 0.35 + 0.6 * sstep(0.3, 0.9, p);
  ctx.drawImage(GEN.moon, mxp - 13, myp - 13, 26, 26);
  ctx.globalAlpha = 1;
  const sp = sstep(0, 0.8, p), sunX = W * 0.74, sunY = lerp(150, 406, sp), R = 46;
  ctx.globalCompositeOperation = 'lighter';
  const set = sstep(0.42, 0.82, p);

  const ha = (0.6 - 0.15 * sp) * (1 - set), ga = 0.42 * set;
  if (ha > SEE) { ctx.globalAlpha = ha; ctx.drawImage(GEN.halo, sunX - 560, sunY - 560, 1120, 1120); }
  if (ga > SEE) { ctx.globalAlpha = ga; ctx.drawImage(GEN.glow, sunX - 520, sunY - 360, 1040, 720); }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  if (sunY < 440) {
    const squash = 1 - 0.1 * sstep(0.3, 0.75, p);
    ctx.globalAlpha = 1 - sp * 0.15;
    ctx.drawImage(GEN.sunA, sunX - R / 0.64, sunY - R / 0.64 * squash, R / 0.64 * 2, R / 0.64 * 2 * squash);
    ctx.globalAlpha = sstep(0.1, 0.65, p);
    ctx.drawImage(GEN.sunB, sunX - R / 0.64, sunY - R / 0.64 * squash, R / 0.64 * 2, R / 0.64 * 2 * squash);
    ctx.globalAlpha = 1;
  }
  for (const c of CLOUDS) {
    const spr = SPR[c.name]; if (!spr) continue;
    const w = spr.vb[2] * c.sc, x = mod(c.x - t * c.sp - dist * c.depth, 3600 + w) - w * 0.5 - 200;
    if (x > W + w || x + w < -w || c.y + spr.vb[3] * c.sc < top) continue;
    ctx.save(); ctx.translate(x, c.y); ctx.scale(c.sc, c.sc);
    blit(ctx, spr, 0, 0, m);
    ctx.restore();
  }
  return { sunX, sunY };
}

function drawBirds(ctx, W, OY, t, p, m) {
  const cyc = 26, k = Math.floor(t / cyc), u = (t - k * cyc) / 9;
  if (u >= 0 && u <= 1 && hash(k * 3.3 + 1) > 0.25) {
    const n = 7 + Math.floor(hash(k) * 6), y0 = lerp(-OY * 0.6 + 14, -OY + 60, hash(k * 1.7));
    const body = css(mixc(hex('#2E6B3A'), hex('#1E2438'), m)), wing = css(mixc(hex('#4E9A44'), hex('#2A2E48'), m));
    for (let i = 0; i < n; i++) {
      const bx = lerp(W + 60, -80, u) + (h2(k, i) - 0.5) * 120 + i * 16, by = y0 + (h2(k + 9, i) - 0.5) * 34 + Math.sin(t * 1.3 + i) * 4;
      const f = Math.sin(t * 15 + i * 1.7), s = 0.8 + h2(k + 3, i) * 0.4;
      ctx.fillStyle = wing; ctx.beginPath();
      ctx.moveTo(bx - 1 * s, by); ctx.lineTo(bx + 3 * s, by - 7 * s * f); ctx.lineTo(bx + 5 * s, by); ctx.fill();
      ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(bx + 2 * s, by + 0.5, 5 * s, 1.6 * s, -0.08, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(bx + 6 * s, by + 0.5); ctx.lineTo(bx + 12 * s, by + 1.8 * s); ctx.lineTo(bx + 6 * s, by + 1.6 * s); ctx.fill();
    }
  }
  ctx.strokeStyle = css(mixc(hex('#6A5470'), hex('#241E3A'), m), 0.7); ctx.lineWidth = 1; ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const bx = mod(hash(i * 4.1) * W * 1.6 - t * (6 + i * 2), W + 200) - 100, by = 150 + hash(i * 2.2) * 120 + Math.sin(t * 0.7 + i) * 6;
    const f = 2.2 + Math.sin(t * 5 + i * 2) * 1.6;
    ctx.moveTo(bx - 4, by - f); ctx.quadraticCurveTo(bx - 2, by - f * 0.4, bx, by); ctx.quadraticCurveTo(bx + 2, by - f * 0.4, bx + 4, by - f);
  }
  ctx.stroke();
}

function visible(open, a, b) { if (!open) return true; for (const [x0, x1] of open) if (b > x0 && a < x1) return true; return false; }
function drawFar(ctx, W, dist, m, p, t, open) {
  const L = lists(); if (!L.far.length) return;
  const off = dist * 0.15, step = 330, blinks = [];
  for (let i = Math.floor((off - 700) / step); i <= Math.floor((off + W + 200) / step); i++) {
    const nm = L.far[Math.floor(hash(i * 1.93 + 4) * L.far.length)], spr = SPR[nm];
    const x = i * step + hash(i * 2.71) * 140 - off;
    if (!visible(open, x + spr.vb[0], x + spr.vb[0] + spr.vb[2])) continue;
    blit(ctx, spr, x, GROUND, m);
    if (spr.m.blink) for (const b of spr.m.blink) blinks.push([x + b[0], GROUND + b[1], i]);
  }
  const ba = sstep(0.3, 0.7, p);
  if (ba > 0) {
    ctx.globalCompositeOperation = 'lighter';
    for (const [x, y, i] of blinks) {
      const on = (t * 0.8 + hash(i)) % 1 < 0.45 ? 1 : 0.15;
      ctx.globalAlpha = ba * on; ctx.drawImage(tinted('#FF3A2A'), x - 6, y - 6, 12, 12);
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }
}
function drawHaze(ctx, W, y0, y1, a) {
  ctx.globalAlpha = a; ctx.drawImage(GEN.haze, 0, 0, 4, 64, -1, y0, W + 2, y1 - y0); ctx.globalAlpha = 1;
}
function drawMid(ctx, W, dist, m, p, t, open) {
  const L = lists(); const off = dist * 0.45;
  const pole = SPR.mid_pole, MS = (pole && pole.m.scale) || 1.5;
  const PS = 560 * MS, poles = [];
  for (let i = Math.floor((off - 300 * MS) / PS); i <= Math.floor((off + W + 300 * MS) / PS); i++) poles.push(i * PS + hash(i * 3.9) * 60 * MS - off);
  const step = 250 * MS;
  for (let pass = 0; pass < 2; pass++) {
    for (let i = Math.floor((off - 500 * MS) / step); i <= Math.floor((off + W + 300 * MS) / step); i++) {
      const r = hash(i * 1.37 + 7), x = i * step + hash(i * 4.4) * 90 * MS - off;
      let nm = null;
      if (pass === 0) { if (r < 0.46 && L.midB.length) nm = L.midB[Math.floor(hash(i * 8.1) * L.midB.length)]; else if (r < 0.62 && L.midT.length) nm = L.midT[Math.floor(hash(i * 6.3) * L.midT.length)]; }
      else if (r >= 0.62 || hash(i * 2.2 + 5) < 0.4) { if (L.midP.length) nm = L.midP[Math.floor(hash(i * 9.7) * L.midP.length)]; }
      if (!nm) continue;
      const spr = SPR[nm], xx = pass ? x + 120 * MS : x;
      if (!visible(open, xx + spr.vb[0], xx + spr.vb[0] + spr.vb[2])) continue;
      blit(ctx, spr, xx, GROUND, m);
      if (spr.neon.length && p > 0.25) { ctx.globalCompositeOperation = 'lighter'; drawNeon(ctx, spr, xx, GROUND, i * 3 + 7, p, t); ctx.globalCompositeOperation = 'source-over'; }
    }
  }
  if (pole) {
    ctx.strokeStyle = css(mixc(hex('#5E4E6A'), hex('#1E1A30'), m), 0.85); ctx.lineWidth = 1.2;
    const tops = pole.m.wires;
    ctx.beginPath();
    for (let k = 0; k < poles.length - 1; k++) {
      const a = poles[k], b = poles[k + 1];
      for (let j = 0; j < tops.length; j++) {
        const [wx, wy] = tops[j], y = GROUND + wy, sag = (16 + (j % 3) * 3) * MS;
        ctx.moveTo(a + wx, y); ctx.quadraticCurveTo((a + b) / 2 + wx, y + sag * 2, b + wx, y);
      }
    }
    ctx.stroke();
    for (const x of poles) if (visible(open, x - 40, x + 40)) blit(ctx, pole, x, GROUND, m);
  }
}

const PAT = {};
function pat(ctx, name, which) {
  const key = name + which; let p = PAT[key];
  if (!p) { const s = SPR[name]; if (!s) return null; p = PAT[key] = { p: ctx.createPattern(s[which], 'repeat'), k: s[which].width / s.vb[2] }; }
  return p;
}
function fillPat(ctx, name, m, x0, y0, w, h, scroll, f) {
  const s = SPR[name]; if (!s) return false;
  for (const which of ['day', 'dusk']) {
    const a = which === 'day' ? 1 : m; if ((which === 'day' && m > 0.999) || a < 0.002) continue;
    const P = pat(ctx, name, which);
    P.p.setTransform(new DOMMatrix([f / P.k, 0, 0, 1 / P.k, -scroll, y0]));
    ctx.globalAlpha = a; ctx.fillStyle = P.p; ctx.fillRect(x0, y0, w, h);
  }
  ctx.globalAlpha = 1; return true;
}
function drawGround(ctx, W, dist, m) {
  const cx = W / 2;
  if (!fillPat(ctx, 'ground_walk', m, 0, GROUND, W, 44, dist, 1)) { ctx.fillStyle = '#D9CDB6'; ctx.fillRect(0, GROUND, W, 44); }
  const J = 64, f2 = 1.07;
  ctx.lineWidth = 1.1;
  const jd = css(mixc(hex('#8A6E70'), hex('#2A2440'), m), 0.45), jl = css(mixc(hex('#FFE9C8'), hex('#8A7AA0'), m), 0.35);
  for (let i = Math.floor(dist / J) - 1; i <= Math.floor((dist + W) / J) + 1; i++) {
    const xb = i * J - dist, xf = cx + (xb - cx) * f2;
    ctx.strokeStyle = jd; ctx.beginPath(); ctx.moveTo(xb, GROUND + 1); ctx.lineTo(xf, GROUND + 44); ctx.stroke();
    ctx.strokeStyle = jl; ctx.beginPath(); ctx.moveTo(xb + 1.2, GROUND + 1); ctx.lineTo(xf + 1.3, GROUND + 44); ctx.stroke();
  }

  if (!fillPat(ctx, 'ground_curb', m, 0, GROUND + 44, W, 6, f2 * dist + cx * (f2 - 1), f2)) { ctx.fillStyle = '#B8AA92'; ctx.fillRect(0, GROUND + 44, W, 6); }
  const f3 = 1.16;
  if (!fillPat(ctx, 'ground_street', m, 0, GROUND + 50, W, H - GROUND - 50, f3 * dist + cx * (f3 - 1), f3)) { ctx.fillStyle = '#34303A'; ctx.fillRect(0, GROUND + 50, W, 70); }
}

function drawNear(ctx, W, dist, m, p, t) {
  nearEnsure(W, dist + W + 1600);
  const L = lists();
  const lights = [];
  const segs = NEAR.segs;
  for (let k = firstSeg(dist - 400); k < segs.length; k++) {
    const sg = segs[k], x = sg.x - dist;
    if (x > W + 400) break;
    if (sg.kind === 'yard') { drawYard(ctx, sg, x, m, L); continue; }
    const spr = SPR[sg.name];
    drawKit(ctx, spr, x, GROUND, m);
    if (sg.kind === 'bldg' && m < 0.9 && hash(sg.i * 4.31 + 0.7) < 0.7) frondShadow(ctx, spr, x, sg.i, m);
    if (spr.neon.length && p > 0.25) lights.push([spr, x, sg.i]);
  }

  const LG = 1900, lamp = SPR.lamp;
  const lampOn = [];
  if (lamp) {
    for (let i = Math.floor((dist - 700) / LG); i <= Math.floor((dist + W + 700) / LG); i++) {
      const X = i * LG + 700 + hash(i * 1.1) * 400;
      if (inPorchZone(X, W, 120)) continue;
      const x = X - dist, r = hash(i * 7.7 + 2);
      const extra = r < 0.32 ? ['bench', 150] : r < 0.55 ? ['hydrant', -260] : r < 0.7 ? ['newsbox', 120] : r < 0.9 ? ['planter', -300] : null;
      if (extra && SPR[extra[0]]) { propShadows(ctx, SPR[extra[0]], x + extra[1], m); drawKit(ctx, SPR[extra[0]], x + extra[1], GROUND, m); }
      propShadows(ctx, lamp, x, m);
      drawKit(ctx, lamp, x, GROUND, m);
      lampOn.push([x, i]);
    }
  }

  if (p > 0.25) {
    ctx.globalCompositeOperation = 'lighter';
    for (const [spr, x, i] of lights) {
      drawNeon(ctx, spr, x, GROUND, i + 1, p, t);
      for (let q = 0; q < spr.neon.length; q++) {
        const n = spr.neon[q], a = neonLevel(n.on, (i + 1) * 13 + q * 101, p, t);
        if (a) pool(ctx, x + n.box[0] + n.box[2] / 2, GROUND + 14, Math.min(n.box[2] * 0.7, 380), 16, n.color, 0.22 * a);
      }
    }
    const wa = sstep(0.35, 0.85, p);
    for (let k = firstSeg(dist - 400); k < segs.length; k++) {
      const sg = segs[k], x = sg.x - dist; if (x > W + 400) break;
      const spr = sg.name && SPR[sg.name]; if (!spr || !spr.m.spill) continue;
      for (const [sx, sw, col, a] of spr.m.spill) pool(ctx, x + sx, GROUND + 12, sw * 0.6, 16, col, 0.32 * a * wa);
    }
    if (lamp) {
      const hd = lamp.m.head || [0, -890];
      for (const [x, i] of lampOn) {
        const on = lampLevel(i, p, t); if (on <= 0) continue;
        const hx = x + hd[0], hy = GROUND + hd[1];
        if (hy > VIEW.top - 80) {
          ctx.globalAlpha = on * 0.95; ctx.drawImage(tinted('#FFD890'), hx - 40, hy - 40, 80, 80);
          ctx.globalAlpha = on * 0.35; ctx.drawImage(tinted('#FFC070'), hx - 150, hy - 140, 300, 280);
        }
        ctx.globalAlpha = on * 0.06; ctx.fillStyle = '#FFC878';
        ctx.beginPath(); ctx.moveTo(hx - 14, hy + 20); ctx.lineTo(hx + 14, hy + 20); ctx.lineTo(hx + 260, GROUND + 30); ctx.lineTo(hx - 260, GROUND + 30); ctx.fill();
        pool(ctx, hx, GROUND + 18, 300, 24, '#FFC070', 0.5 * on);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }
}
function frondShadow(ctx, spr, x, i, m) {
  const w = spr.m.walls; if (!w.length) return;
  let x0 = 1e9, x1 = -1e9, y0 = 1e9;
  for (const r of w) { x0 = Math.min(x0, r[0]); x1 = Math.max(x1, r[0] + r[2]); y0 = Math.min(y0, r[1]); }
  const fw = 980 + hash(i * 2.2) * 420, fh = fw * 0.6;
  const fx = x + x0 + hash(i * 1.7) * Math.max(0, x1 - x0 - fw * 0.6) - fw * 0.2, fy = GROUND - 560 - hash(i * 3.9) * 260;
  if (fx > VIEW.W || fx + fw < 0) return;
  ctx.save();
  ctx.beginPath();
  for (const r of w) ctx.rect(x + r[0], GROUND + r[1], r[2], r[3]);
  ctx.clip();
  ctx.globalAlpha = 0.16 * (1 - m);
  ctx.drawImage(GEN.frondTint || (GEN.frondTint = (() => { const c = mk(200, 120), q = c.getContext('2d'); q.drawImage(GEN.fronds, 0, 0); q.globalCompositeOperation = 'source-in'; q.fillStyle = '#2E2060'; q.fillRect(0, 0, 200, 120); return c; })()), fx, fy, fw, fh);
  ctx.restore();
}
function lampLevel(i, p, t) {
  const at = 0.5 + hash(i * 2.9) * 0.08;
  if (p < at) return 0;
  if (p < at + 0.012) return hash(Math.floor(t * 12) + i) > 0.55 ? 0.7 : 0.1;
  return Math.min(1, 0.6 + (p - at) * 3);
}
function drawYard(ctx, sg, x, m, L) {
  if (!L.yard.length) return;

  ctx.save();
  ctx.beginPath(); ctx.rect(x - 300, VIEW.top - 10, sg.w + 300, H - VIEW.top + 20); ctx.clip();
  let u = 0, k = 0;
  while (u < sg.w - 0.5) {
    const nm = L.yard[Math.floor(h2(sg.i, k) * L.yard.length)], spr = SPR[nm], w = spr.m.foot;
    if (u + w > sg.w + 0.5) { ctx.beginPath(); ctx.rect(x + u - 300, VIEW.top - 10, sg.w - u + 300, H - VIEW.top + 20); ctx.clip(); }
    drawKit(ctx, spr, x + u, GROUND, m);
    u += w - 1; k++;
  }
  ctx.restore();
}

function drawTreeAt(ctx, sx, ground, s) {
  const spr = SPR.tree; if (!spr) return;
  ctx.save();
  const p = clamp((s && s.progress) || 0, 0, 1), m = sstep(0.22, 0.86, p), vw = VIEW.W, vt = VIEW.top;
  if (s && s.W) { VIEW.W = s.W; VIEW.top = -(s.OY || 0); } else { VIEW.W = 1e9; VIEW.top = -1e9; }
  if (spr.m.kit) drawKit(ctx, spr, sx, ground, m); else blit(ctx, spr, sx, ground, m);

  const id = Math.round(((s && s.dist) || 0) + sx), pick = hash(Math.floor(id / 7) * 0.731), D = TDECOR[Math.floor(pick * TDECOR.length)];
  if (D && SPR[D]) blit(ctx, SPR[D], sx, ground, m);
  if (!(s && s.W)) { VIEW.W = vw; VIEW.top = vt; }
  ctx.restore();
}

const TREES = { list: [], wide: false, lastDist: 0, W: 0 };
function rememberTree(sx, ground, s) {
  if (sx < -262) TREES.wide = true;
  if (TREES.wide) return;
  const wx = Math.round(s.dist + sx);
  for (const tr of TREES.list) if (Math.abs(tr.wx - wx) < 2) { tr.seen = s.dist; return; }
  TREES.list.push({ wx, ground, seen: s.dist });
}
function drawLeavingTrees(ctx, dist, s) {
  if (dist < TREES.lastDist - 1 || s.W !== TREES.W) TREES.list = [];
  TREES.lastDist = dist; TREES.W = s.W;
  if (TREES.wide || !TREES.list.length) return;
  const half = (SPR.tree && SPR.tree.m.half) ? SPR.tree.m.half[1] : 650;
  TREES.list = TREES.list.filter(tr => tr.wx - dist > -half - 40);
  for (const tr of TREES.list) {
    const sx = tr.wx - dist;
    if (sx <= -260 && sx > -half - 40) drawTreeAt(ctx, sx, tr.ground, s);
  }
}

function fallback(ctx, s) {
  const W = s.W, OY = s.OY || 0;
  const g = ctx.createLinearGradient(0, -OY, 0, GROUND);
  g.addColorStop(0, '#2B2748'); g.addColorStop(0.5, '#6E557F'); g.addColorStop(0.85, '#EE9C66'); g.addColorStop(1, '#F7D7A4');
  ctx.fillStyle = g; ctx.fillRect(0, -OY, W, GROUND + OY);
  ctx.fillStyle = '#D9CDB6'; ctx.fillRect(0, GROUND, W, 44);
  ctx.fillStyle = '#B8AA92'; ctx.fillRect(0, GROUND + 44, W, 6);
  ctx.fillStyle = '#34303A'; ctx.fillRect(0, GROUND + 50, W, H - GROUND - 50);
}
const Scene = {
  config: CFG,
  ready: null,
  memoryMB() { return Math.round(PIXELS * 4 / 1e5) / 10; },
  drawBackground(ctx, s) {
    ctx.save();
    try {
      if (!READY) { fallback(ctx, s); return; }
      const W = s.W, OY = s.OY || 0, dist = s.dist || 0, t = s.t || 0, p = clamp(s.progress || 0, 0, 1);
      VIEW.W = W; VIEW.top = -OY;
      const m = sstep(0.22, 0.86, p);
      const open = openColumns(W, dist);
      let sun = { sunX: W * 0.74, sunY: lerp(150, 406, sstep(0, 0.8, p)) };
      if (open.length) {
        ctx.save();
        if (open.length > 1 || open[0][0] > 0 || open[0][1] < W) {
          ctx.beginPath();
          for (const [a, b] of open) ctx.rect(a, -OY - 2, b - a, GROUND + OY + 12);
          ctx.clip();
        }
        sun = drawSky(ctx, W, OY, p, t, dist, m);
        drawFar(ctx, W, dist, m, p, t, open);
        drawHaze(ctx, W, 300, GROUND, 0.9);
        drawMid(ctx, W, dist, m, p, t, open);
        drawHaze(ctx, W, 340, GROUND, 0.45);
        const ba = 0.28 * (1 - sstep(0.5, 0.9, p));
        if (ba > SEE) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = ba;
          ctx.drawImage(GEN.glow, sun.sunX - 300, sun.sunY - 200, 600, 400);
        }
        ctx.restore();
      }
      drawGround(ctx, W, dist, m);
      drawNear(ctx, W, dist, m, p, t);
      drawBirds(ctx, W, OY, t, p, m);
      drawLeavingTrees(ctx, dist, s);
      Scene._sun = sun;
    } finally { ctx.restore(); }
  },
  drawTree(ctx, sx, ground, s) {
    drawTreeAt(ctx, sx, ground, s);
    if (s && s.dist !== undefined) rememberTree(sx, ground, s);
  },
  drawPorch(ctx, sx, ground, s) {
    const spr = SPR.porch; if (!spr) return;
    ctx.save();
    const p = clamp((s && s.progress) || 0, 0, 1), m = sstep(0.22, 0.86, p), t = (s && s.t) || 0;
    const vw = VIEW.W, vt = VIEW.top;
    if (s && s.W) { VIEW.W = s.W; VIEW.top = -(s.OY || 0); } else { VIEW.W = 1e9; VIEW.top = -1e9; }
    drawKit(ctx, spr, sx, ground, m);
    if (!(s && s.W)) { VIEW.W = vw; VIEW.top = vt; }
    if (p > 0.3) {
      ctx.globalCompositeOperation = 'lighter';
      const on = lampLevel(77, p, t), L = spr.m.light;
      if (L && on > 0) {
        ctx.globalAlpha = on * 0.95; ctx.drawImage(tinted('#FFD890'), sx + L[0] - 30, ground + L[1] - 28, 60, 56);
        ctx.globalAlpha = on * 0.4; ctx.drawImage(tinted('#FFC070'), sx + L[0] - 130, ground + L[1] - 110, 260, 220);
        pool(ctx, sx - 40, ground + 14, 230, 22, '#FFC070', 0.45 * on);
      }
      if (spr.neon.length) drawNeon(ctx, spr, sx, ground, 5, p, t);
    }
    ctx.restore();
  },
  drawForeground(ctx, s) {
    if (!READY) return;
    ctx.save();
    try {
      const W = s.W, OY = s.OY || 0, dist = s.dist || 0, t = s.t || 0, p = clamp(s.progress || 0, 0, 1), m = sstep(0.22, 0.86, p);
      const fg = SPR.fg_trunk;
      const moving = Math.abs(dist - (Scene._lastDist === undefined ? dist : Scene._lastDist)) > 0.05;
      Scene._lastDist = dist;
      Scene._fgA = CFG.fgFade ? lerp(Scene._fgA || 0, moving ? 1 : 0, 0.06) : 1;
      if (fg && CFG.fgTrunk && Scene._fgA > 0.01) {
        const off = dist * 1.7, step = 5200;
        for (let i = Math.floor(off / step); i <= Math.floor((off + W + 400) / step); i++) {
          if (i < 1 || hash(i * 5.5) < 0.35) continue;
          const x = i * step + hash(i) * 1200 - off;
          if (x < -200 || x > W + 200) continue;
          blit(ctx, fg, x, GROUND, m, Scene._fgA);
        }
      }
      const sun = Scene._sun;
      const fa = sun ? 0.18 * (1 - sstep(0.45, 0.85, p)) : 0;
      if (fa > SEE) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = fa;
        ctx.drawImage(GEN.glow, sun.sunX - 480, sun.sunY - 360, 960, 720);
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.globalAlpha = 1;
      if (CFG.vignette) { ctx.globalAlpha = 0.55 + 0.35 * m; ctx.drawImage(GEN.vignette, -2, -OY - 2, W + 4, H + OY + 4); }
      if (CFG.grain) {
        const P = GEN.grainPat || (GEN.grainPat = ctx.createPattern(GEN.grain, 'repeat'));
        const j = Math.floor(t * 24);
        P.setTransform(new DOMMatrix([0.6, 0, 0, 0.6, hash(j) * 128, hash(j + 0.5) * 128]));
        ctx.globalAlpha = 0.5; ctx.fillStyle = P; ctx.fillRect(0, -OY, W, H + OY);
      }
    } finally { ctx.restore(); }
  },
};
Scene.ready = (async () => {
  makeGenerated();
  const jobs = Object.keys(MAN).map(k => loadAsset(k, MAN[k]).catch(e => { console.warn(e.message); }));
  await Promise.all(jobs);
  LISTS = null; lists(); cloudSetup();
  for (const c of ['#FFD08A', '#FFC070', '#FFD890', '#FF3A2A']) tinted(c);
  for (const k in SPR) { for (const n of SPR[k].neon) tinted(n.color); for (const sp of SPR[k].m.spill || []) tinted(sp[2]); }
  READY = true;
  return Scene;
})();
window.Scene = Scene;
})();
