(* Copyright (C) 2015-2016 Bloomberg Finance L.P.
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * In addition to the permissions granted to you by the LGPL, you may combine
 * or link a "work that uses the Library" with a publicly distributed version
 * of this file to produce a combined library or application, then distribute
 * that combined work under the terms of your choosing, with no requirement
 * to comply with the obligations normally placed on you by section 4 of the
 * LGPL version 3 (or the corresponding section of a later version of the LGPL
 * should you choose to use a later version).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA. *)






(* 
   Principle: since in ocaml, the apply order is not specified 
   rules:
   1. each argument it is only used once, (avoid eval duplication)
   2. it's actually used, if not (Lsequence)
   3. no nested  compuation, 
      other wise the evaluation order is tricky (make sure eval order is correct)
*)

type value = 
  { mutable used : bool ; 
    lambda  : Lambda.lambda
  }
let param_hash : (Ident.t , value) Hashtbl.t = Hashtbl.create 20
let simple_beta_reduce params body args = 
  let module E = struct exception Not_simple_apply end in
  let rec find_param v  opt = 
    match Hashtbl.find param_hash v with 
    | exp ->  
      if exp.used then raise E.Not_simple_apply
      else exp.used <- true; exp.lambda
    | exception Not_found -> opt
  in  
  let rec aux acc (us : Lambda.lambda list) = 
    match us with 
    | [] -> List.rev acc
    | (Lvar x as a ) :: rest 
      -> 
      aux  (find_param x a  :: acc) rest 
    | (Lconst  _  as u) :: rest 
      -> aux (u :: acc) rest 
    | _ :: _ -> raise E.Not_simple_apply 
  in 
  match (body : Lambda.lambda) with 
  | Lprim ( primitive , args' )  (* There is no lambda in primitive *)
    -> (* catch a special case of primitives *)
    (* Note in a very special case we can avoid any allocation
       {[
         when Ext_list.for_all2_no_exn
             (fun p a ->
                match (a : Lambda.lambda) with
                | Lvar a -> Ident.same p a
                | _ -> false ) params args'
       ]}*)
    let () = 
      List.iter2 (fun p a -> Hashtbl.add param_hash p {lambda = a; used = false }) params args  
    in 
    begin match aux [] args' with 
    | us -> 
      let result = 
        Hashtbl.fold (fun _param {lambda; used} code -> 
            if not used then
              Lam_comb.seq lambda code
            else code) param_hash (Lam_comb.prim primitive us) in 
      Hashtbl.clear param_hash;
      Some result 
    | exception _ -> 
      Hashtbl.clear param_hash ;
      None
    end
  | Lapply (Lvar fn_name as f , args', info)
    ->  
    let () = 
      List.iter2 (fun p a -> Hashtbl.add param_hash p {lambda = a; used = false }) params args  
    in 
    (*since we adde each param only once, 
      iff it is removed once, no exception, 
      if it is removed twice there will be exception.
      if it is never removed, we have it as rest keys 
    *)
    begin match aux [] args' with 
      | us -> 
        let f = find_param fn_name  f in
        let result = 
          Hashtbl.fold 
            (fun _param {lambda; used} code -> 
               if not used then 
                 Lam_comb.seq lambda code
               else code )
            param_hash (Lambda.Lapply ( f, us , info)) in
        Hashtbl.clear param_hash;
        Some result 
      | exception _ -> 
        Hashtbl.clear param_hash; 
        None
    end
  | _ -> None
