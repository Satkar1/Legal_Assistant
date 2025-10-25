import os
from supabase import create_client, Client
from dotenv import load_dotenv
import json
from datetime import datetime
import logging

# Set up logging
logger = logging.getLogger(__name__)

load_dotenv()

class SupabaseFIRClient:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        # Prefer service role key if available, otherwise fall back to anon key
        self.key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
        
        if not self.url or not self.key:
            raise ValueError("Supabase URL and Key must be set in environment variables")
        
        self.supabase: Client = create_client(self.url, self.key)
        logger.info("✅ Supabase client initialized successfully")
    
    def store_fir_record(self, fir_data):
        """Store FIR record in Supabase with proper error handling"""
        try:
            logger.info(f"💾 Attempting to store FIR record: {fir_data.get('fir_number', 'Unknown')}")
            
            # Clean the data - remove None values and handle special cases
            clean_data = {}
            for key, value in fir_data.items():
                if value is None:
                    # Set appropriate defaults for None values
                    if key in ['victim_age']:
                        clean_data[key] = 0
                    elif key in ['ipc_sections']:
                        clean_data[key] = '[]'
                    else:
                        clean_data[key] = ''
                else:
                    clean_data[key] = value
            
            # Ensure required fields are present
            if 'fir_number' not in clean_data:
                logger.error("❌ Missing fir_number in FIR data")
                return {"success": False, "error": "FIR number is required"}
            
            logger.info(f"📦 Cleaned FIR data for storage: {clean_data['fir_number']}")
            
            response = self.supabase.table("fir_records").insert(clean_data).execute()
            
            if response.data:
                logger.info(f"✅ FIR stored successfully in Supabase: {clean_data['fir_number']} with ID: {response.data[0]['id']}")
                return {"success": True, "id": response.data[0]['id']}
            else:
                error_msg = str(response.error) if response.error else "Unknown database error"
                logger.error(f"❌ FIR storage failed for {clean_data['fir_number']}: {error_msg}")
                return {"success": False, "error": error_msg}
                
        except Exception as e:
            logger.error(f"💥 Exception in store_fir_record for {fir_data.get('fir_number', 'Unknown')}: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def search_fir_records(self, filters=None):
        """Search FIR records with various filters"""
        try:
            query = self.supabase.table("fir_records").select("*")
            
            if filters:
                if filters.get('start_date') and filters.get('end_date'):
                    query = query.gte('incident_date', filters['start_date'])\
                                .lte('incident_date', filters['end_date'])
                
                if filters.get('date'):
                    query = query.eq('incident_date', filters['date'])
                
                if filters.get('incident_type'):
                    query = query.eq('incident_type', filters['incident_type'])
                
                if filters.get('police_station'):
                    query = query.eq('police_station', filters['police_station'])
                
                if filters.get('district'):
                    query = query.eq('district', filters['district'])
                
                if filters.get('ipc_section'):
                    query = query.ilike('ipc_sections', f'%{filters["ipc_section"]}%')
                
                if filters.get('search_text'):
                    query = query.ilike('incident_description', f'%{filters["search_text"]}%')
            
            query = query.order('created_at', desc=True)
            response = query.execute()
            
            logger.info(f"🔍 FIR search completed. Found {len(response.data) if response.data else 0} records")
            return {"success": True, "data": response.data}
            
        except Exception as e:
            logger.error(f"💥 FIR search error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_fir_by_number(self, fir_number):
        """Get specific FIR by FIR number"""
        try:
            logger.info(f"🔍 Fetching FIR: {fir_number}")
            
            response = self.supabase.table("fir_records")\
                .select("*")\
                .eq("fir_number", fir_number)\
                .execute()
            
            if response.data:
                logger.info(f"✅ FIR found: {fir_number}")
                return {"success": True, "data": response.data[0]}
            else:
                logger.warning(f"⚠️ FIR not found: {fir_number}")
                return {"success": False, "error": "FIR not found"}
                
        except Exception as e:
            logger.error(f"💥 Get FIR error for {fir_number}: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_monthly_report(self, year, month):
        """Get monthly FIR report"""
        try:
            start_date = f"{year}-{month:02d}-01"
            next_month = month + 1 if month < 12 else 1
            next_year = year if month < 12 else year + 1
            end_date = f"{next_year}-{next_month:02d}-01"
            
            logger.info(f"📊 Generating monthly report for {month}/{year}")
            
            response = self.supabase.table("fir_records")\
                .select("*")\
                .gte('incident_date', start_date)\
                .lt('incident_date', end_date)\
                .order('incident_date')\
                .execute()
            
            logger.info(f"✅ Monthly report generated: {len(response.data) if response.data else 0} records")
            return {"success": True, "data": response.data}
            
        except Exception as e:
            logger.error(f"💥 Monthly report error for {month}/{year}: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_crime_statistics(self, start_date, end_date):
        """Get crime statistics for dashboard"""
        try:
            logger.info(f"📈 Getting crime statistics from {start_date} to {end_date}")
            
            response = self.supabase.table("fir_records")\
                .select("incident_type")\
                .gte('incident_date', start_date)\
                .lte('incident_date', end_date)\
                .execute()
            
            type_counts = {}
            for record in response.data:
                incident_type = record['incident_type']
                type_counts[incident_type] = type_counts.get(incident_type, 0) + 1
            
            logger.info(f"✅ Crime statistics generated: {len(response.data)} total records")
            
            return {
                "success": True,
                "type_counts": type_counts,
                "total_records": len(response.data),
                "date_range": {"start": start_date, "end": end_date}
            }
            
        except Exception as e:
            logger.error(f"💥 Crime statistics error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def create_case_activity(self, activity_data):
        """Create a case activity record"""
        try:
            logger.info(f"📝 Creating case activity for FIR: {activity_data.get('fir_number', 'Unknown')}")
            
            response = self.supabase.table("case_activities").insert(activity_data).execute()
            
            if response.data:
                logger.info(f"✅ Case activity created successfully")
                return {"success": True, "id": response.data[0]['id']}
            else:
                error_msg = str(response.error) if response.error else "Unknown error"
                logger.error(f"❌ Case activity creation failed: {error_msg}")
                return {"success": False, "error": error_msg}
                
        except Exception as e:
            logger.error(f"💥 Case activity creation error: {str(e)}")
            return {"success": False, "error": str(e)}
