import React, { useState, useMemo } from 'react';
import { useSidebarStore } from '../store/sidebarStore';
import { 
  Search, 
  ExternalLink, 
  GraduationCap, 
  DollarSign, 
  Award, 
  BookOpen,
  Building2
} from 'lucide-react';

interface PlacementCompany {
  name: string;
  ctc: string;
  cgpa: string;
  marks12th: string;
  topics: string;
  link: string;
}

const COMPANIES_DATA: PlacementCompany[] = [
  { name: "Tata Consultancy Services (TCS)", ctc: "3.36 - 9.0", cgpa: "6.0", marks12th: "60%", topics: "Aptitude, Basic Programming (C/C++), SQL", link: "https://www.tcs.com/careers" },
  { name: "Infosys", ctc: "3.6 - 9.5", cgpa: "6.0", marks12th: "60%", topics: "DSA, DBMS, Java/Python, Puzzles", link: "https://www.infosys.com/careers" },
  { name: "Wipro", ctc: "3.5 - 10.0", cgpa: "6.0", marks12th: "60%", topics: "Logical Reasoning, Coding (Java/C++), Automata", link: "https://careers.wipro.com" },
  { name: "HCLTech", ctc: "4.25 - 9.0", cgpa: "6.5", marks12th: "60%", topics: "OOPS, Data Structures, Computer Networks", link: "https://www.hcltech.com/careers" },
  { name: "Cognizant", ctc: "4.0 - 10.0", cgpa: "6.0", marks12th: "60%", topics: "Automata Fix, SQL, Basic DSA", link: "https://careers.cognizant.com" },
  { name: "Tech Mahindra", ctc: "3.25 - 5.5", cgpa: "6.0", marks12th: "60%", topics: "Aptitude, Basic Coding, Storytelling/Verbal", link: "https://careers.techmahindra.com" },
  { name: "Capgemini", ctc: "4.25 - 7.5", cgpa: "6.0", marks12th: "60%", topics: "Pseudocode, Game-based Aptitude, English", link: "https://www.capgemini.com/careers" },
  { name: "Accenture", ctc: "4.5 - 11.9", cgpa: "6.5", marks12th: "60%", topics: "Cloud Basics, Security, DSA, Verbal", link: "https://www.accenture.com/careers" },
  { name: "IBM", ctc: "4.5 - 11.0", cgpa: "6.5", marks12th: "60%", topics: "Cognitive Games, English, Basic Programming", link: "https://www.ibm.com/careers" },
  { name: "LTIMindtree", ctc: "4.0 - 10.0", cgpa: "6.0", marks12th: "60%", topics: "Coding (Medium level), SQL, Automata", link: "https://www.ltimindtree.com/careers" },
  { name: "Google", ctc: "30.0 - 60.0", cgpa: "7.5", marks12th: "75%", topics: "Advanced DSA, System Design, Dynamic Programming", link: "https://careers.google.com" },
  { name: "Amazon", ctc: "25.0 - 45.0", cgpa: "7.0", marks12th: "70%", topics: "Trees, Graphs, Leadership Principles, OOPS", link: "https://amazon.jobs" },
  { name: "Microsoft", ctc: "20.0 - 50.0", cgpa: "7.5", marks12th: "70%", topics: "String Manipulation, System Design, C++/C#", link: "https://careers.microsoft.com" },
  { name: "Meta", ctc: "35.0 - 60.0+", cgpa: "7.5", marks12th: "75%", topics: "Graph Theory, DP, Scalability, React", link: "https://www.metacareers.com" },
  { name: "Apple", ctc: "25.0 - 45.0", cgpa: "7.5", marks12th: "75%", topics: "OS, Swift/C++, Low-level Design", link: "https://www.apple.com/careers" },
  { name: "Netflix", ctc: "40.0 - 70.0", cgpa: "8.0", marks12th: "75%", topics: "Distributed Systems, Advanced Java/C++, DSA", link: "https://jobs.netflix.com" },
  { name: "Uber", ctc: "30.0 - 45.0", cgpa: "7.5", marks12th: "75%", topics: "System Design, Algorithms, High-level Architecture", link: "https://www.uber.com/careers" },
  { name: "Airbnb", ctc: "25.0 - 40.0", cgpa: "7.5", marks12th: "75%", topics: "React, Node.js, Frontend Architecture, DSA", link: "https://careers.airbnb.com" },
  { name: "LinkedIn", ctc: "25.0 - 45.0", cgpa: "7.5", marks12th: "75%", topics: "Java, Concurrency, API Design, DSA", link: "https://careers.linkedin.com" },
  { name: "Atlassian", ctc: "25.0 - 55.0", cgpa: "7.5", marks12th: "75%", topics: "System Design, React, Core Java, Problem Solving", link: "https://www.atlassian.com/company/careers" },
  { name: "Salesforce", ctc: "18.0 - 32.0", cgpa: "7.0", marks12th: "70%", topics: "Java, DBMS, Cloud concepts, DSA", link: "https://salesforce.com/company/careers" },
  { name: "Adobe", ctc: "20.0 - 40.0", cgpa: "7.0", marks12th: "70%", topics: "OS Concepts, Pointers, Arrays, OOPS (C++)", link: "https://adobe.com/careers" },
  { name: "Oracle", ctc: "15.0 - 35.0", cgpa: "7.0", marks12th: "70%", topics: "DBMS, SQL Optimization, Java, Core OOPS", link: "https://oracle.com/careers" },
  { name: "Cisco", ctc: "15.0 - 25.0", cgpa: "7.0", marks12th: "70%", topics: "Computer Networks, C/C++, Embedded Systems", link: "https://jobs.cisco.com" },
  { name: "Intel", ctc: "15.0 - 25.0", cgpa: "7.0", marks12th: "70%", topics: "Digital Electronics, OS, C++, Computer Architecture", link: "https://jobs.intel.com" },
  { name: "AMD", ctc: "14.0 - 24.0", cgpa: "7.0", marks12th: "70%", topics: "C++, GPU Architecture, OS concepts", link: "https://careers.amd.com" },
  { name: "Nvidia", ctc: "18.0 - 35.0", cgpa: "7.5", marks12th: "75%", topics: "C/C++, CUDA, Deep Learning basics, OS", link: "https://nvidia.com/en-us/about-nvidia/careers" },
  { name: "Goldman Sachs", ctc: "22.0 - 35.0", cgpa: "7.0", marks12th: "75%", topics: "Mathematics, Probability, Hard DSA", link: "https://goldmansachs.com/careers" },
  { name: "JPMorgan Chase", ctc: "15.0 - 24.0", cgpa: "7.0", marks12th: "70%", topics: "Java, Spring Boot, DSA, Puzzles", link: "https://careers.jpmorgan.com" },
  { name: "Morgan Stanley", ctc: "16.0 - 25.0", cgpa: "7.0", marks12th: "70%", topics: "Core Java, Multithreading, Algorithms", link: "https://morganstanley.com/careers" },
  { name: "Visa", ctc: "18.0 - 28.0", cgpa: "7.0", marks12th: "70%", topics: "Cryptography basics, Java, DSA", link: "https://visa.com/careers" },
  { name: "Mastercard", ctc: "14.0 - 22.0", cgpa: "7.0", marks12th: "70%", topics: "Java, API Design, Security, DSA", link: "https://careers.mastercard.com" },
  { name: "American Express", ctc: "14.0 - 20.0", cgpa: "7.0", marks12th: "70%", topics: "Python, SQL, Machine Learning basics", link: "https://careers.americanexpress.com" },
  { name: "PayPal", ctc: "18.0 - 30.0", cgpa: "7.0", marks12th: "70%", topics: "Node.js, Java, System Design, DSA", link: "https://paypal.com/us/webapps/mpp/jobs" },
  { name: "Stripe", ctc: "30.0 - 50.0", cgpa: "7.5", marks12th: "75%", topics: "API Design, Practical Coding, Ruby/Python", link: "https://stripe.com/jobs" },
  { name: "Intuit", ctc: "20.0 - 35.0", cgpa: "7.5", marks12th: "70%", topics: "Java, React, LLD, HLD, DSA", link: "https://careers.intuit.com" },
  { name: "Bloomberg", ctc: "30.0 - 45.0", cgpa: "7.5", marks12th: "75%", topics: "C++, Python, Advanced DSA, OS", link: "https://bloomberg.com/careers" },
  { name: "Razorpay", ctc: "15.0 - 25.0", cgpa: "7.0", marks12th: "70%", topics: "PHP/Go, Scalability, Medium-Hard DSA", link: "https://razorpay.com/jobs" },
  { name: "PhonePe", ctc: "18.0 - 35.0", cgpa: "7.0", marks12th: "70%", topics: "Java, High Concurrency, DSA, System Design", link: "https://phonepe.com/careers" },
  { name: "CRED", ctc: "20.0 - 40.0", cgpa: "7.5", marks12th: "70%", topics: "Backend Systems, LLD, Java/Go, AWS", link: "https://careers.cred.club" },
  { name: "Groww", ctc: "15.0 - 25.0", cgpa: "7.0", marks12th: "70%", topics: "React Native, Java, Distributed Systems", link: "https://groww.in/careers" },
  { name: "Paytm", ctc: "10.0 - 20.0", cgpa: "7.0", marks12th: "70%", topics: "Node.js, Java, General DSA", link: "https://paytm.com/careers" },
  { name: "Pine Labs", ctc: "12.0 - 18.0", cgpa: "7.0", marks12th: "70%", topics: "Core Java, Networking, DBMS", link: "https://pinelabs.com/careers" },
  { name: "Zeta", ctc: "20.0 - 35.0", cgpa: "7.5", marks12th: "70%", topics: "Core Java, OS, System Design", link: "https://zeta.tech/careers" },
  { name: "BharatPe", ctc: "15.0 - 25.0", cgpa: "7.0", marks12th: "70%", topics: "Python, Django, System Architecture", link: "https://bharatpe.com/careers" },
  { name: "Flipkart", ctc: "18.0 - 32.0", cgpa: "7.0", marks12th: "70%", topics: "Machine Coding, LLD, Trees, Graphs", link: "https://flipkartcareers.com" },
  { name: "Myntra", ctc: "16.0 - 28.0", cgpa: "7.0", marks12th: "70%", topics: "Java, System Design, E-commerce Logic", link: "https://careers.myntra.com" },
  { name: "Swiggy", ctc: "18.0 - 35.0", cgpa: "7.0", marks12th: "70%", topics: "Java/Go, Algorithms, Location-based Services", link: "https://careers.swiggy.com" },
  { name: "Zomato", ctc: "18.0 - 35.0", cgpa: "7.0", marks12th: "70%", topics: "React, Node.js, Data Engineering, DSA", link: "https://zomato.com/careers" },
  { name: "Ola", ctc: "12.0 - 24.0", cgpa: "7.0", marks12th: "70%", topics: "Java, Go, Mapping Algorithms", link: "https://olaelectric.com/careers" },
  { name: "OYO", ctc: "10.0 - 18.0", cgpa: "6.5", marks12th: "65%", topics: "Ruby, Java, DBMS, General Programming", link: "https://careers.oyorooms.com" },
  { name: "MakeMyTrip", ctc: "12.0 - 20.0", cgpa: "7.0", marks12th: "70%", topics: "Java, Frontend (React), Search Algorithms", link: "https://careers.makemytrip.com" },
  { name: "Dream11", ctc: "20.0 - 35.0", cgpa: "7.0", marks12th: "70%", topics: "High-scale systems, Java/Go, Database Indexing", link: "https://about.dream11.in/careers" },
  { name: "ShareChat", ctc: "15.0 - 30.0", cgpa: "7.0", marks12th: "70%", topics: "Mobile Dev, Backend, Scalability", link: "https://sharechat.com/careers" },
  { name: "Meesho", ctc: "18.0 - 32.0", cgpa: "7.0", marks12th: "70%", topics: "Java, Python, LLD, Android", link: "https://meesho.io/jobs" },
  { name: "Udaan", ctc: "15.0 - 25.0", cgpa: "7.0", marks12th: "70%", topics: "Kotlin, Python, Supply Chain Logic", link: "https://udaan.com/careers" },
  { name: "Delhivery", ctc: "12.0 - 20.0", cgpa: "7.0", marks12th: "70%", topics: "Node.js, Python, Routing Algorithms", link: "https://delhivery.com/careers" },
  { name: "Lenskart", ctc: "10.0 - 18.0", cgpa: "6.5", marks12th: "65%", topics: "Java, Spring Boot, Frontend Basics", link: "https://hiring.lenskart.com" },
  { name: "Upstox", ctc: "15.0 - 25.0", cgpa: "7.0", marks12th: "70%", topics: "Java, Event-driven Architecture, DSA", link: "https://upstox.com/careers" },
  { name: "Zerodha", ctc: "15.0 - 25.0", cgpa: "None", marks12th: "None", topics: "Open Source, Python, Go, System Design", link: "https://zerodha.com/careers" },
  { name: "Postman", ctc: "15.0 - 25.0", cgpa: "7.0", marks12th: "70%", topics: "JavaScript, Node.js, API Architecture", link: "https://postman.com/company/careers" },
  { name: "BrowserStack", ctc: "14.0 - 24.0", cgpa: "7.0", marks12th: "70%", topics: "Ruby, Java, Networking Concepts", link: "https://browserstack.com/careers" },
  { name: "Freshworks", ctc: "12.0 - 20.0", cgpa: "7.0", marks12th: "70%", topics: "Ruby on Rails, Ember.js, Java, DSA", link: "https://freshworks.com/company/careers" },
  { name: "Zoho", ctc: "8.0 - 12.0", cgpa: "None", marks12th: "None", topics: "C/C++, Java, Puzzles, Core Logic", link: "https://zoho.com/careers" },
  { name: "Sprinklr", ctc: "20.0 - 35.0", cgpa: "7.5", marks12th: "70%", topics: "Java, React, Distributed Systems, Graph DSA", link: "https://sprinklr.com/careers" },
  { name: "Samsung", ctc: "14.0 - 22.0", cgpa: "7.0", marks12th: "70%", topics: "Advanced C/C++, Tree/Graph, DP, OS", link: "https://research.samsung.com/careers" },
  { name: "SAP Labs", ctc: "12.0 - 22.0", cgpa: "7.0", marks12th: "70%", topics: "Java, C++, DBMS, ABAP basics", link: "https://jobs.sap.com" },
  { name: "VMware", ctc: "18.0 - 32.0", cgpa: "7.0", marks12th: "70%", topics: "C/C++, Java, OS Concepts, Virtualization", link: "https://careers.vmware.com" },
  { name: "Qualcomm", ctc: "15.0 - 25.0", cgpa: "7.5", marks12th: "75%", topics: "C, Bit Manipulation, OS, Wireless Comms", link: "https://qualcomm.com/company/careers" },
  { name: "Broadcom", ctc: "18.0 - 30.0", cgpa: "7.5", marks12th: "75%", topics: "Computer Architecture, C/C++, Networking", link: "https://broadcom.com/company/careers" },
  { name: "Texas Instruments", ctc: "15.0 - 25.0", cgpa: "7.5", marks12th: "75%", topics: "Analog/Digital Electronics, C programming", link: "https://careers.ti.com" },
  { name: "Juniper Networks", ctc: "15.0 - 25.0", cgpa: "7.0", marks12th: "70%", topics: "C, TCP/IP, OS, Data Structures", link: "https://juniper.net/us/en/company/careers" },
  { name: "Arista Networks", ctc: "18.0 - 28.0", cgpa: "7.0", marks12th: "70%", topics: "C/C++, Python, Networking Protocols", link: "https://arista.com/en/careers" },
  { name: "Palo Alto Networks", ctc: "18.0 - 30.0", cgpa: "7.0", marks12th: "70%", topics: "C/C++, Python, Network Security, Go", link: "https://jobs.paloaltonetworks.com" },
  { name: "Fortinet", ctc: "12.0 - 20.0", cgpa: "7.0", marks12th: "70%", topics: "C, Networking, Linux OS", link: "https://fortinet.com/corporate/careers" },
  { name: "Nutanix", ctc: "20.0 - 35.0", cgpa: "7.5", marks12th: "75%", topics: "C/C++, Systems Programming, OS", link: "https://nutanix.com/company/careers" },
  { name: "Rubrik", ctc: "25.0 - 40.0", cgpa: "7.5", marks12th: "75%", topics: "C++, Go, Distributed File Systems, DSA", link: "https://rubrik.com/company/careers" },
  { name: "Cohesity", ctc: "25.0 - 40.0", cgpa: "7.5", marks12th: "75%", topics: "C/C++, OS, Algorithms, File Systems", link: "https://cohesity.com/company/careers" },
  { name: "Snowflake", ctc: "30.0 - 50.0", cgpa: "7.5", marks12th: "75%", topics: "Java, C++, Databases, Cloud Architecture", link: "https://careers.snowflake.com" },
  { name: "Databricks", ctc: "35.0 - 55.0", cgpa: "7.5", marks12th: "75%", topics: "Scala, Java, Spark concepts, Hard DSA", link: "https://databricks.com/company/careers" },
  { name: "ServiceNow", ctc: "18.0 - 30.0", cgpa: "7.0", marks12th: "70%", topics: "Java, JavaScript, Web Architecture", link: "https://careers.servicenow.com" },
  { name: "Workday", ctc: "18.0 - 28.0", cgpa: "7.0", marks12th: "70%", topics: "Java, Object-Oriented Design, XpressO", link: "https://workday.com/en-us/company/careers" },
  { name: "Fivetran", ctc: "15.0 - 25.0", cgpa: "7.0", marks12th: "70%", topics: "Java, SQL, Data Engineering logic", link: "https://fivetran.com/careers" },
  { name: "Epic Games", ctc: "25.0 - 45.0", cgpa: "7.5", marks12th: "75%", topics: "C++, 3D Math, Computer Graphics", link: "https://epicgames.com/site/en-US/careers" },
  { name: "Electronic Arts (EA)", ctc: "14.0 - 25.0", cgpa: "7.0", marks12th: "70%", topics: "C++, Game Engine basics, DSA", link: "https://ea.com/careers" },
  { name: "Sony (India Software)", ctc: "12.0 - 20.0", cgpa: "7.0", marks12th: "70%", topics: "C/C++, Embedded C, Android Framework", link: "https://sony.co.in/microsite/careers" },
  { name: "Siemens", ctc: "8.0 - 14.0", cgpa: "6.5", marks12th: "65%", topics: "C/C++, PLM, Python, Basic DSA", link: "https://jobs.siemens.com" },
  { name: "Bosch", ctc: "7.0 - 12.0", cgpa: "6.5", marks12th: "65%", topics: "Embedded C, Python, Automotive basics", link: "https://bosch.in/careers" },
  { name: "Honeywell", ctc: "8.0 - 14.0", cgpa: "6.5", marks12th: "65%", topics: "C/C++, Java, Control Systems", link: "https://careers.honeywell.com" },
  { name: "GE Digital", ctc: "9.0 - 15.0", cgpa: "6.5", marks12th: "65%", topics: "Java, Python, Cloud Computing", link: "https://jobs.gecareers.com" },
  { name: "Barclays", ctc: "14.0 - 22.0", cgpa: "7.0", marks12th: "70%", topics: "Java, C++, Spring, UNIX", link: "https://search.jobs.barclays" },
  { name: "Wells Fargo", ctc: "15.0 - 25.0", cgpa: "7.0", marks12th: "70%", topics: "Java, .NET, SQL, DSA", link: "https://wellsfargojobs.com" },
  { name: "DE Shaw", ctc: "35.0 - 50.0", cgpa: "8.0", marks12th: "75%", topics: "Math, OS, Core Java, Advanced Algorithms", link: "https://deshawindia.com/careers" },
  { name: "Arcesium", ctc: "25.0 - 40.0", cgpa: "7.5", marks12th: "75%", topics: "Java, Python, Financial tech logic, DSA", link: "https://arcesium.com/careers" },
  { name: "Directi", ctc: "25.0 - 40.0", cgpa: "7.0", marks12th: "70%", topics: "Dynamic Programming, Graph Theory, System Design", link: "https://careers.directi.com" },
  { name: "Media.net", ctc: "18.0 - 30.0", cgpa: "7.0", marks12th: "70%", topics: "Hard DSA, C++, Java, Scaling", link: "https://careers.media.net" },
  { name: "Publicis Sapient", ctc: "12.0 - 20.0", cgpa: "6.5", marks12th: "65%", topics: "Java, Node.js, Cloud, React", link: "https://careers.publicissapient.com" },
  { name: "Thoughtworks", ctc: "10.0 - 15.0", cgpa: "None", marks12th: "None", topics: "Clean Code, OOPS, Pair Programming, Java", link: "https://thoughtworks.com/careers" },
  { name: "CGI", ctc: "4.5 - 7.5", cgpa: "6.0", marks12th: "60%", topics: "SQL, Java, Manual/Automation Testing", link: "https://cgi.com/en/careers" },
  { name: "Hexaware", ctc: "4.0 - 6.0", cgpa: "6.0", marks12th: "60%", topics: "Aptitude, Basic Coding (Java/Python)", link: "https://jobs.hexaware.com" }
];

export const CompaniesPage: React.FC = () => {
  const setSidebarContent = useSidebarStore(state => state.setContent);
  const [searchQuery, setSearchQuery] = useState('');
  const [minCtc, setMinCtc] = useState('');
  const [minCgpa, setMinCgpa] = useState('');

  React.useEffect(() => {
    setSidebarContent(
      <div className="space-y-6 animate-in fade-in duration-200">
        <div>
          <h3 className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase mb-2">Search</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Google, Trees, SQL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase mb-2">Minimum CTC (LPA)</h3>
          <input
            type="number"
            placeholder="e.g. 10"
            value={minCtc}
            onChange={(e) => setMinCtc(e.target.value)}
            className="w-full px-2 py-1.5 bg-background border border-border rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
          />
        </div>

        <div>
          <h3 className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase mb-2">Maximum CGPA Cutoff</h3>
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 7.0"
            value={minCgpa}
            onChange={(e) => setMinCgpa(e.target.value)}
            className="w-full px-2 py-1.5 bg-background border border-border rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
          />
        </div>
      </div>
    );
    return () => setSidebarContent(null);
  }, [searchQuery, minCtc, minCgpa, setSidebarContent]);

  const filteredCompanies = useMemo(() => {
    return COMPANIES_DATA.filter(comp => {
      const matchesSearch = 
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.topics.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesCtc = true;
      if (minCtc) {
        const ctcNum = parseFloat(comp.ctc.split('-')[0].trim());
        if (!isNaN(ctcNum) && ctcNum < parseFloat(minCtc)) {
          matchesCtc = false;
        }
      }

      let matchesCgpa = true;
      if (minCgpa && comp.cgpa !== 'None') {
        const cgpaNum = parseFloat(comp.cgpa);
        if (!isNaN(cgpaNum) && cgpaNum > parseFloat(minCgpa)) {
          matchesCgpa = false;
        }
      }

      return matchesSearch && matchesCtc && matchesCgpa;
    });
  }, [searchQuery, minCtc, minCgpa]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-display font-extrabold tracking-tight uppercase text-foreground">
          Company intelligence hub
        </h2>
        <p className="text-sm text-muted-foreground font-sans mt-1">
          Explore eligibility cutoffs, compensation packages, required technical competencies, and official hiring resources.
        </p>
      </div>



      {/* Placement List Container */}
      <div className="border-t border-border/30 overflow-hidden">
        {filteredCompanies.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
            <Building2 className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <h3 className="text-base font-semibold text-foreground font-sans">
              No Companies Match Criteria
            </h3>
            <p className="text-xs text-muted-foreground font-sans mt-1">
              Adjust your search keywords or filter values.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    Company Name
                  </th>
                  <th className="px-4 py-3 text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    CTC Range
                  </th>
                  <th className="px-4 py-3 text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    CGPA Cutoff
                  </th>
                  <th className="px-4 py-3 text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    12th Cutoff
                  </th>
                  <th className="px-4 py-3 text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    Important Preparation Topics
                  </th>
                  <th className="px-4 py-3 text-right text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    Career Link
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCompanies.map((comp, idx) => (
                  <tr 
                    key={idx}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-[4px] bg-muted border border-border/60 text-muted-foreground">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm text-foreground font-sans block">
                          {comp.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-foreground">
                        <DollarSign className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs font-mono font-semibold">
                          {comp.ctc} LPA
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-foreground">
                        <GraduationCap className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs font-mono font-medium">
                          {comp.cgpa === 'None' ? 'No Limit' : `${comp.cgpa} +`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-foreground">
                        <Award className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs font-mono">
                          {comp.marks12th === 'None' ? 'No Limit' : comp.marks12th}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground font-sans line-clamp-2" title={comp.topics}>
                          {comp.topics}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={comp.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-border hover:bg-muted text-foreground text-xs font-semibold rounded-[4px] transition-colors font-sans"
                      >
                        Careers
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
